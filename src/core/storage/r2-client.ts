import type { File } from 'node:buffer';

export interface StorageClient {
  uploadFile(file: File, path: string): Promise<string>;
  deleteFile(path: string): Promise<string>;
  getSignedUrl(path: string, expiresIn: number): Promise<string>;
  patchFile(file: File, path: string): Promise<string>;
}
/*

export class R2StorageClient implements StorageClient {

}*/
