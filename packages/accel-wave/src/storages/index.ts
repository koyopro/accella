/**
 * Interface representing a storage system for files.
 */
export interface Storage {
  /**
   * Stores a file.
   * @param file The file to store
   * @param identifier The identifier for the file
   */
  store(file: File, identifier: string): void;

  /**
   * Retrieves a file.
   * @param identifier The identifier for the file
   * @returns The retrieved file
   */
  retrive(identifier: string): File;

  /**
   * Deletes a file.
   * @param identifier The identifier for the file
   */
  delete(identifier: string): void;

  /**
   * Gets the URL of a file.
   * @param identifier The identifier for the file
   * @returns The URL of the file
   */
  url(identifier: string): URL;
}
