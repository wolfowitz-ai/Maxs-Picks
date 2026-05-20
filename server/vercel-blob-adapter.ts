import { randomUUID } from "crypto";
import { put, del } from "@vercel/blob";

export class VercelBlobStorageService {
  async putBuffer(
    buffer: Buffer,
    options: { contentType: string; filename?: string },
  ): Promise<string> {
    const base = options.filename || `${randomUUID()}.bin`;
    const safe = base.replace(/[^a-zA-Z0-9._-]/g, "_");
    const pathname = `uploads/${randomUUID()}-${safe}`;
    const { url } = await put(pathname, buffer, {
      access: "public",
      contentType: options.contentType,
      addRandomSuffix: false,
    });
    return url;
  }

  async getUploadUrlAndPath(): Promise<{ uploadURL: string; objectPath: string }> {
    // Vercel Blob doesn't use the presigned-PUT pattern from server code paths.
    // This is kept only to satisfy the adapter interface; callers use putBuffer().
    throw new Error(
      "Vercel Blob adapter requires putBuffer(); presigned upload URLs are not supported here.",
    );
  }

  async deleteObjectEntity(objectPath: string): Promise<void> {
    try {
      if (!objectPath) return;
      // Only attempt to delete real blob URLs. Legacy /objects/* paths are
      // ignored — there's nothing to delete on Vercel Blob.
      if (!/^https?:\/\//i.test(objectPath)) {
        return;
      }
      await del(objectPath);
    } catch (err) {
      console.warn("Vercel Blob delete failed:", err);
    }
  }

  normalizeObjectEntityPath(rawPath: string): string {
    return rawPath;
  }
}
