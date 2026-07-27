import fs = require("fs/promises");
import path = require("path");
import IStorageProvider = require("./storage.interface.js");

class LocalDiskStorageProvider implements IStorageProvider {
  private readonly uploadDir: string;

  constructor() {
    // Relative upload directory within backend
    this.uploadDir = path.resolve(__dirname, "../../../../uploads");
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error: any) {
      console.error("[LocalDiskStorageProvider] Directory creation failed:", error);
    }
  }

  public async uploadFile(key: string, buffer: Buffer): Promise<void> {
    await this.ensureDirectoryExists();
    const filePath = path.join(this.uploadDir, key);
    await fs.writeFile(filePath, buffer);
  }

  public async getFile(key: string): Promise<Buffer> {
    const filePath = path.join(this.uploadDir, key);
    try {
      return await fs.readFile(filePath);
    } catch (error: any) {
      throw new Error(`File with key '${key}' could not be read or does not exist on disk`);
    }
  }

  public async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      console.warn(`[LocalDiskStorageProvider] Warning: Failed to delete file at path '${filePath}'`, error?.message || error);
    }
  }
}

export = LocalDiskStorageProvider;
