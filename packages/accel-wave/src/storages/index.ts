export interface Storage {
  store(file: File, identifier: string): void;
  retrive(identifier: string): File;
  url(identifier: string): URL;
}
