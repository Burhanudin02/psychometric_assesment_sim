import fs from "fs";
import path from "path";
import crypto from "crypto";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
]);

const EXTENSION_MAP: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export interface StoredImageResult {
  url: string;
  storagePath: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
}

export class ImageStorageService {
  private static uploadDir = path.join(process.cwd(), "public", "uploads", "questions");

  public static ensureUploadDirectory() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  public static validateImage(fileSize: number, mimeType: string) {
    if (fileSize > MAX_FILE_SIZE_BYTES) {
      throw new Error(`Ukuran file melebihi batas maksimum 5MB (Ukuran: ${(fileSize / (1024 * 1024)).toFixed(2)}MB).`);
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
      throw new Error(`Tipe file tidak didukung (${mimeType}). Hanya format PNG, JPEG, WEBP, dan SVG yang diizinkan.`);
    }
  }

  public static async saveImage(
    buffer: Buffer,
    originalFilename: string,
    mimeType: string
  ): Promise<StoredImageResult> {
    this.validateImage(buffer.length, mimeType);
    this.ensureUploadDirectory();

    const normalizedMime = mimeType.toLowerCase();
    const ext = EXTENSION_MAP[normalizedMime] || "png";
    const uniqueId = crypto.randomUUID();
    const filename = `${uniqueId}.${ext}`;
    const destinationPath = path.join(this.uploadDir, filename);

    await fs.promises.writeFile(destinationPath, buffer);

    return {
      url: `/uploads/questions/${filename}`,
      storagePath: destinationPath,
      filename,
      originalFilename,
      mimeType: normalizedMime,
      size: buffer.length,
    };
  }

  public static async deleteImage(urlOrPath: string): Promise<boolean> {
    try {
      const filename = path.basename(urlOrPath);
      const filePath = path.join(this.uploadDir, filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting image file:", err);
      return false;
    }
  }
}

