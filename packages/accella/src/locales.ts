import { deepMerge } from "accel-record/merge";
import { Resource } from "i18next";
// @ts-ignore
import yaml from "js-yaml";

/**
 * Load the following files from src/config/locales/ and merge their contents to obtain the locale resources.
 */
export const loadLocaleResources = async (): Promise<Resource> => {
  let resources = {};
  for await (const [path, part] of iterateLocaleFiles()) {
    try {
      resources = deepMerge(resources, splitByDot(part));
    } catch {
      console.warn(`[accella] Error loading locale resources of ${path} in loadLocaleResources()`);
    }
  }
  return resources;
};

const splitByDot = (obj: any) => {
  if (typeof obj !== "object") return obj;
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split(".");
    let current = result;
    for (const [i, key] of keys.entries()) {
      if (i === keys.length - 1) {
        current[key] = splitByDot(value);
      } else {
        current[key] = current[key] || {};
        current = current[key];
      }
    }
  }
  return result;
};

async function* iterateLocaleFiles() {
  const modules = import.meta.glob("/src/config/locales/**/*.{js,ts,mjs,mts,cjs,cts}", {
    import: "default",
  });
  for (const [path, importPromise] of Object.entries(modules)) {
    yield [path, await importPromise()];
  }
  const ymls = import.meta.glob("/src/config/locales/**/*.{yml,yaml,json}", {
    import: "default",
    query: "?raw",
  });
  for (const [path, importPromise] of Object.entries(ymls)) {
    yield [path, yaml.load(await importPromise())];
  }
}
