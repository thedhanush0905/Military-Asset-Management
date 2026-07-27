abstract class IStorageProvider {
  abstract uploadFile(key: string, buffer: Buffer): Promise<void>;
  abstract getFile(key: string): Promise<Buffer>;
  abstract deleteFile(key: string): Promise<void>;
}

export = IStorageProvider;
