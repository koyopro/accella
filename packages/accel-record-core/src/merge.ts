function isObject(item: any): item is any {
  return item && typeof item === "object" && !Array.isArray(item);
}
function mergeArrays<T>(arr1: T[], arr2: T[]): T[] {
  return Array.from(new Set([...arr1, ...arr2]));
}

export function deepMerge<T extends object>(target: T, source: T): T;
export function deepMerge(target: any, source: any) {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = deepMerge(target[key], source[key]);
      } else if (Array.isArray(source[key])) {
        output[key] =
          target[key] && Array.isArray(target[key])
            ? mergeArrays(target[key], source[key])
            : source[key];
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}
