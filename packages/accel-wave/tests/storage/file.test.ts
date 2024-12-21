import { Config } from "src/config";
import { FileStorage } from "src/storages/file";
import { buildFile } from "../buildFile";

test("store() and delete()", () => {
  const config = new Config();
  const storage = new FileStorage(config);

  const file = buildFile();
  const path = `${config.storeDir}/${file.name}`;
  storage.store(file, path);

  const retrivedFile = storage.retrive(path);
  expect(retrivedFile.name).toBe(file.name);

  expect(storage.url(path).href).toMatch(new RegExp("file:///.+/public/uploads/example.txt"));

  storage.delete(path);
});
