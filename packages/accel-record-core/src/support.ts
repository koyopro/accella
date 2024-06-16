type ToHash<A extends ReadonlyArray<T>, T> = <K extends PropertyKey, V>(
  this: A,
  callback: (item: T) => [K, V]
) => Record<K, V>;

declare global {
  interface Array<T> {
    toHash: ToHash<Array<T>, T>;
  }
  interface ReadonlyArray<T> {
    toHash: ToHash<ReadonlyArray<T>, T>;
  }
}

Array.prototype.toHash = function <T, K extends PropertyKey, V>(
  this: Array<T>,
  callback: (item: T) => [K, V]
): Record<K, V> {
  const ret = {} as Record<K, V>;
  for (const item of this) {
    const [key, value] = callback(item);
    ret[key] = value;
  }
  return ret;
};

export {};
