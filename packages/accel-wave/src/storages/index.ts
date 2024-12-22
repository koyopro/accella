export interface Storage {
  store(file: File, identifier: string): void;
  retrive(identifier: string): File;
  delete(identifier: string): void;
  url(identifier: string): URL;
}
