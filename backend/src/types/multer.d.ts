declare module 'multer' {
  interface MulterFile {
    originalname: string;
    mimetype: string;
  }

  interface DiskStorageOptions {
    destination(
      request: unknown,
      file: MulterFile,
      callback: (error: Error | null, destination: string) => void,
    ): void;
    filename(
      request: unknown,
      file: MulterFile,
      callback: (error: Error | null, filename: string) => void,
    ): void;
  }

  export function diskStorage(options: DiskStorageOptions): unknown;
}
