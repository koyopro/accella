type ToHash<A extends ReadonlyArray<T>, T> = <K extends PropertyKey, V>(
  this: A,
  callback: (item: T, index: number) => [K, V]
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
  callback: (item: T, index: number) => [K, V]
): Record<K, V> {
  const ret = {} as Record<K, V>;
  this.forEach((item, index) => {
    const [key, value] = callback(item, index);
    ret[key] = value;
  });
  return ret;
};

export {};
