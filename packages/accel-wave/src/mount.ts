import type { Model } from "accel-record";
import type { BaseUploader } from "./index.js";

/**
 * Mounts an uploader to a model.
 * Associates file upload functionality with a model attribute.
 * After the model is saved, the uploader's store function is called,
 * and after the model is destroyed, uploader's store(null) is called.
 *
 * @param model - The model instance where the uploader will be mounted
 * @param attr - The name of the model attribute where the file path will be stored
 * @param uploaderClass - The uploader class to use
 * @returns Configured uploader instance
 *
 * @example
 * ```typescript
 * import { BaseUploader, mount } from "accel-wave";
 *
 * class ProfileModel extends ApplicationRecord {
 *   // The file path will be stored in the avatarPath column
 *   avatar = mount(this, "avatarPath", BaseUploader);
 * }
 * ```
 */
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
