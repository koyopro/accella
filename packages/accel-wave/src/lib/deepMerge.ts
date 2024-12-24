export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export const deepMerge = (target: any, source: any) => {
  const isObject = (obj: any) => obj && typeof obj === "object";

  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  Object.keys(source).forEach((key) => {
    const targetValue = target[key];
    const sourceValue = source[key];

    let value: any;
    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      value = targetValue.concat(sourceValue);
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      value = deepMerge(Object.assign({}, targetValue), sourceValue);
    } else {
      value = sourceValue;
    }
    Object.defineProperty(target, key, {
      value: value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  });

  return target;
};
