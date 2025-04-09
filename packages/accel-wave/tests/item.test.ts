import { BaseUploader, Config, FileStorage, Item } from "../src";
import { buildFile } from "./buildFile";

test("Item#path", () => {
  const config = new Config();
  const storage = new FileStorage(config);

  const uploader = new BaseUploader();
  const item = new Item("test.txt", storage, uploader);
  expect(item.path).toBe("uploads/test.txt");

  const customUploader = new BaseUploader({ storeDir: "custom" });
  const customItem = new Item("myfile.txt", storage, customUploader);
  expect(customItem.path).toBe("custom/myfile.txt");
});

test("Item initialization does not call storage.retrive", () => {
  const uploader = new BaseUploader();
  const storage = (uploader as any)._storage;
  const filename = "test-lazy-load.txt";
  const testFile = buildFile(filename);
  uploader.store(testFile);

  const spyRetrive = vi.spyOn(storage, "retrive");

  // At the time of Item initialization, storage.retrive is not called
  const item = new Item(filename, storage, uploader);
  expect(spyRetrive).not.toHaveBeenCalled();
  expect((item as any)._file).toBeUndefined();

  // Accessing the file triggers a call to storage.retrive
  const file = item.file;
  expect(spyRetrive).toHaveBeenCalledOnce();
  expect(spyRetrive).toHaveBeenCalledWith(`uploads/${filename}`);
  expect(file).toBeDefined();
  expect(file.name).toBe(filename);

  // On the second access, the retrive function should not be called (it should be cached).
  spyRetrive.mockClear();
  expect(item.file).toBe(file);
  expect(spyRetrive).not.toHaveBeenCalled();
});
