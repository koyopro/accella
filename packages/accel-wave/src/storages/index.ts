export interface Storage {
  store(file: File): void;
  retrive(identifier: string): File;
}
