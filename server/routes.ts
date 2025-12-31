import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import { checkAdminAuth, verifyAdminPassword } from "./auth";
import { scrapeAmazonProduct } from "./scraper";

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

  // Amazon scraper route (admin only)
  app.post("/api/admin/scrape", checkAdminAuth, async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL or ASIN is required" });
      }

      const scrapedData = await scrapeAmazonProduct(url);
      res.json(scrapedData);
    } catch (error) {
      console.error("Error scraping Amazon:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to scrape product" });
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

  return httpServer;
}
