import type { Model } from "accel-record";
import type { BaseUploader } from ".";

export const mount = <T extends Model>(
  model: T,
  attr: keyof T & string,
  uploaderClass: typeof BaseUploader
) => {
  const uploader = new uploaderClass();
  uploader.model = model;
  uploader.attr = attr;
  model.callbacks.after["save"].push(() => {
    uploader.store();
  });
  model.callbacks.after["destroy"].push(() => {
    uploader.store(null);
  });
  return uploader;
};
