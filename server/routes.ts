import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import { checkAdminAuth, verifyAdminPassword } from "./auth";
import { scrapeAmazonProduct, extractASINFromUrl } from "./scraper";
import { fetchFromPAAPI, extractASIN, getAvailableMarketplaces } from "./amazon-api";
import axios from "axios";
import fs from "fs";
import path from "path";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Admin login route
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      const isValid = verifyAdminPassword(password);
      
      if (!isValid) {
        return res.status(401).json({ error: "Invalid password" });
      }

      // Return the password as the token (simple auth)
      res.json({ token: password });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ error: "Failed to authenticate" });
    }
  });

  // Get available marketplaces for PA-API
  app.get("/api/admin/marketplaces", checkAdminAuth, (req, res) => {
    res.json(getAvailableMarketplaces());
  });

  // Amazon PA-API import (official API)
  app.post("/api/admin/import/pa-api", checkAdminAuth, async (req, res) => {
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
  app.post("/api/admin/import/scrape", checkAdminAuth, async (req, res) => {
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
  app.post("/api/admin/scrape", checkAdminAuth, async (req, res) => {
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

  // Download and save image locally
  app.post("/api/admin/save-image", checkAdminAuth, async (req, res) => {
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

      const contentType = response.headers["content-type"] || "image/jpeg";
      const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
      
      const sanitizedFilename = (filename || `product_${Date.now()}`)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 50);
      
      const finalFilename = `${sanitizedFilename}_${Date.now()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "attached_assets", "product_images");
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, finalFilename);
      fs.writeFileSync(filePath, response.data);
      
      const localPath = `/attached_assets/product_images/${finalFilename}`;
      res.json({ localPath, filename: finalFilename });
    } catch (error) {
      console.error("Error saving image:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to save image" });
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

  app.post("/api/products", checkAdminAuth, async (req, res) => {
    try {
      const validationResult = insertProductSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromError(validationResult.error);
        return res.status(400).json({ error: validationError.toString() });
      }

      const product = await storage.createProduct(validationResult.data);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", checkAdminAuth, async (req, res) => {
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

  app.delete("/api/products/:id", checkAdminAuth, async (req, res) => {
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

  app.post("/api/categories", checkAdminAuth, async (req, res) => {
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

  app.patch("/api/categories/:id", checkAdminAuth, async (req, res) => {
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

  app.delete("/api/categories/:id", checkAdminAuth, async (req, res) => {
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
