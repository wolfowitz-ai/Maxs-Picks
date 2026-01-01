import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { scrapeAmazonProduct, extractASINFromUrl } from "./scraper";
import { fetchFromPAAPI, extractASIN, getAvailableMarketplaces } from "./amazon-api";
import { spinText } from "./ai-spinner";
import axios from "axios";
import fs from "fs";
import path from "path";
import { z } from "zod";
import sharp from "sharp";

const spinRequestSchema = z.object({
  field: z.enum(["title", "description", "maxsTake"]),
  existingText: z.string().optional(),
  productContext: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    price: z.string().optional(),
  }),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await setupAuth(app);
  registerAuthRoutes(app);

  // Get available marketplaces for PA-API
  app.get("/api/admin/marketplaces", isAuthenticated, (req, res) => {
    res.json(getAvailableMarketplaces());
  });

  // Amazon PA-API import (official API)
  app.post("/api/admin/import/pa-api", isAuthenticated, async (req, res) => {
    try {
      const { url, imageCount = 1, marketplace = "US" } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL or ASIN is required" });
      }

      const asin = extractASIN(url);
      const productData = await fetchFromPAAPI(asin, imageCount, marketplace);
      res.json(productData);
    } catch (error) {
      console.error("Error fetching from PA-API:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch from Amazon PA-API" });
    }
  });

  // Amazon scraper import (fallback method)
  app.post("/api/admin/import/scrape", isAuthenticated, async (req, res) => {
    try {
      const { url, imageCount = 1 } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL or ASIN is required" });
      }

      const scrapedData = await scrapeAmazonProduct(url, imageCount);
      res.json(scrapedData);
    } catch (error) {
      console.error("Error scraping Amazon:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to scrape product" });
    }
  });

  // Legacy scrape endpoint (for backward compatibility)
  app.post("/api/admin/scrape", isAuthenticated, async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL or ASIN is required" });
      }

      const scrapedData = await scrapeAmazonProduct(url, 1);
      res.json(scrapedData);
    } catch (error) {
      console.error("Error scraping Amazon:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to scrape product" });
    }
  });

  // Download, process, and save image locally with standardized sizing
  app.post("/api/admin/save-image", isAuthenticated, async (req, res) => {
    try {
      const { imageUrl, filename } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }

      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 30000,
      });

      const sanitizedFilename = (filename || `product_${Date.now()}`)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 50);
      
      const timestamp = Date.now();
      const uploadDir = path.join(process.cwd(), "attached_assets", "product_images");
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      let localPath: string;
      let thumbnailPath: string | undefined;
      let mainFilename: string;

      try {
        // Process main image: resize to 1200x900 (4:3 ratio), convert to WebP
        mainFilename = `${sanitizedFilename}_${timestamp}.webp`;
        const mainFilePath = path.join(uploadDir, mainFilename);
        
        await sharp(response.data)
          .resize(1200, 900, {
            fit: "cover",
            position: "center",
          })
          .webp({ quality: 85 })
          .toFile(mainFilePath);

        // Process thumbnail: resize to 400x400 (square for cards), convert to WebP
        const thumbFilename = `${sanitizedFilename}_${timestamp}_thumb.webp`;
        const thumbFilePath = path.join(uploadDir, thumbFilename);
        
        await sharp(response.data)
          .resize(400, 400, {
            fit: "cover",
            position: "center",
          })
          .webp({ quality: 80 })
          .toFile(thumbFilePath);
        
        localPath = `/attached_assets/product_images/${mainFilename}`;
        thumbnailPath = `/attached_assets/product_images/${thumbFilename}`;
      } catch (sharpError) {
        // Fallback: save original image if Sharp processing fails
        console.warn("Sharp processing failed, saving original image:", sharpError);
        const contentType = response.headers["content-type"] || "image/jpeg";
        const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
        mainFilename = `${sanitizedFilename}_${timestamp}.${ext}`;
        const fallbackPath = path.join(uploadDir, mainFilename);
        fs.writeFileSync(fallbackPath, response.data);
        localPath = `/attached_assets/product_images/${mainFilename}`;
      }
      
      res.json({ 
        localPath, 
        thumbnailPath,
        filename: mainFilename 
      });
    } catch (error) {
      console.error("Error saving image:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to save image" });
    }
  });

  // File upload endpoint for direct image uploads
  app.post("/api/admin/upload-image", isAuthenticated, async (req, res) => {
    try {
      const chunks: Buffer[] = [];
      
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      
      const imageBuffer = Buffer.concat(chunks);
      
      if (imageBuffer.length === 0) {
        return res.status(400).json({ error: "No image data received" });
      }

      const timestamp = Date.now();
      const sanitizedFilename = `upload_${timestamp}`;
      const uploadDir = path.join(process.cwd(), "attached_assets", "product_images");
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Process main image: resize to 1200x900 (4:3 ratio), convert to WebP
      const mainFilename = `${sanitizedFilename}.webp`;
      const mainFilePath = path.join(uploadDir, mainFilename);
      
      await sharp(imageBuffer)
        .resize(1200, 900, {
          fit: "cover",
          position: "center",
        })
        .webp({ quality: 85 })
        .toFile(mainFilePath);

      // Process thumbnail: resize to 400x400 (square for cards)
      const thumbFilename = `${sanitizedFilename}_thumb.webp`;
      const thumbFilePath = path.join(uploadDir, thumbFilename);
      
      await sharp(imageBuffer)
        .resize(400, 400, {
          fit: "cover",
          position: "center",
        })
        .webp({ quality: 80 })
        .toFile(thumbFilePath);

      const localPath = `/attached_assets/product_images/${mainFilename}`;
      const thumbnailPath = `/attached_assets/product_images/${thumbFilename}`;
      
      res.json({ 
        localPath, 
        thumbnailPath,
        filename: mainFilename 
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to upload image" });
    }
  });
  
  // AI Text Spinner endpoint
  app.post("/api/admin/spin-text", isAuthenticated, async (req, res) => {
    try {
      const validationResult = spinRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromError(validationResult.error);
        return res.status(400).json({ error: validationError.toString() });
      }

      const spunText = await spinText(validationResult.data);
      res.json({ text: spunText });
    } catch (error) {
      console.error("Error spinning text:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate text" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      
      if (category && category !== "All") {
        const products = await storage.getProductsByCategory(category);
        return res.json(products);
      }
      
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req, res) => {
    try {
      const validationResult = insertProductSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromError(validationResult.error);
        return res.status(400).json({ error: validationError.toString() });
      }

      // Check for duplicate ASIN if provided
      const asin = validationResult.data.asin;
      if (asin) {
        const existingProduct = await storage.getProductByAsin(asin);
        if (existingProduct) {
          return res.status(409).json({ 
            error: `A product with ASIN "${asin}" already exists: "${existingProduct.title}"` 
          });
        }
      }

      const product = await storage.createProduct(validationResult.data);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const partialSchema = insertProductSchema.partial();
      const validationResult = partialSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromError(validationResult.error);
        return res.status(400).json({ error: validationError.toString() });
      }

      const product = await storage.updateProduct(req.params.id, validationResult.data);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const allCategories = await storage.getAllCategories();
      res.json(allCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const validationResult = insertCategorySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromError(validationResult.error);
        return res.status(400).json({ error: validationError.toString() });
      }

      const category = await storage.createCategory(validationResult.data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.patch("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const partialSchema = insertCategorySchema.partial();
      const validationResult = partialSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromError(validationResult.error);
        return res.status(400).json({ error: validationError.toString() });
      }

      const category = await storage.updateCategory(req.params.id, validationResult.data);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteCategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  return httpServer;
}
