import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Express, Response } from "express";

const UPLOAD_DIR = path.resolve(process.cwd(), "local-uploads");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export class LocalObjectStorageService {
  constructor() {
    ensureUploadDir();
  }

  async getUploadUrlAndPath(): Promise<{ uploadURL: string; objectPath: string }> {
    const objectId = randomUUID();
    const objectPath = `/objects/uploads/${objectId}`;
    const uploadURL = `__LOCAL__:${objectId}`;
    return { uploadURL, objectPath };
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const objectId = randomUUID();
    return `__LOCAL__:${objectId}`;
  }

  async saveFileLocally(objectPath: string, buffer: Buffer, contentType: string): Promise<void> {
    ensureUploadDir();
    const relativePath = objectPath.replace(/^\/objects\//, "");
    const dir = path.join(UPLOAD_DIR, path.dirname(relativePath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(path.join(UPLOAD_DIR, relativePath), buffer);
  }

  async downloadObject(objectPath: string, res: Response): Promise<void> {
    const relativePath = objectPath.replace(/^\/objects\//, "");
    const filePath = path.join(UPLOAD_DIR, relativePath);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "Object not found" });
      return;
    }

    const stat = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = ext === ".webp" ? "image/webp" : "application/octet-stream";

    res.set({
      "Content-Type": contentType,
      "Content-Length": String(stat.size),
      "Cache-Control": "public, max-age=3600",
    });

    fs.createReadStream(filePath).pipe(res);
  }

  async deleteObjectEntity(objectPath: string): Promise<void> {
    try {
      const normalizedPath = this.normalizeObjectEntityPath(objectPath);
      if (!normalizedPath.startsWith("/objects/")) {
        console.warn("Cannot delete external URL:", objectPath);
        return;
      }
      const relativePath = normalizedPath.replace(/^\/objects\//, "");
      const filePath = path.join(UPLOAD_DIR, relativePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // Already deleted or doesn't exist
    }
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (rawPath.startsWith("/objects/")) {
      return rawPath;
    }
    if (rawPath.startsWith("https://storage.googleapis.com/")) {
      const url = new URL(rawPath);
      const parts = url.pathname.split("/");
      const uploadsIndex = parts.indexOf("uploads");
      if (uploadsIndex >= 0) {
        return `/objects/${parts.slice(uploadsIndex).join("/")}`;
      }
    }
    return rawPath;
  }
}

export function registerLocalObjectStorageRoutes(app: Express): void {
  const localService = new LocalObjectStorageService();

  app.post("/api/uploads/request-url", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Missing required field: name" });
      }

      const objectId = randomUUID();
      const objectPath = `/objects/uploads/${objectId}`;

      res.json({
        uploadURL: `http://localhost:${process.env.PORT || 5000}/api/uploads/direct/${objectId}`,
        objectPath,
        metadata: { name },
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.put("/api/uploads/direct/:objectId", async (req, res) => {
    try {
      ensureUploadDir();
      const { objectId } = req.params;
      const uploadsDir = path.join(UPLOAD_DIR, "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => chunks.push(chunk));
      req.on("end", () => {
        const buffer = Buffer.concat(chunks);
        fs.writeFileSync(path.join(uploadsDir, objectId), buffer);
        res.status(200).json({ success: true });
      });
    } catch (error) {
      console.error("Error saving file:", error);
      res.status(500).json({ error: "Failed to save file" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      await localService.downloadObject(req.path, res);
    } catch (error) {
      console.error("Error serving object:", error);
      res.status(500).json({ error: "Failed to serve object" });
    }
  });
}
