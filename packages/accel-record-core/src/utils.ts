type InstanceTypeIntersection<T extends any[]> = T extends [
  infer Head extends (abstract new (...args: any) => any),
  ...infer Tail extends (abstract new (...args: any) => any)[]
]
  ? InstanceType<Head> & InstanceTypeIntersection<Tail>
  : {};

type ObjectIntersection<T extends any[]> = T extends [
  infer Head extends (abstract new (...args: any) => any),
  ...infer Tail extends (abstract new (...args: any) => any)[]
]
  ? { [K in keyof Head]: Head[K] } & ObjectIntersection<Tail>
  : { };

export const classIncludes = <T extends (abstract new (...args: any) => any)[]>(
  ...args: T
): { new (): InstanceTypeIntersection<T> } & ObjectIntersection<T> => {
  const newClass: any = class {};
  for (let arg of args) {
    for (let key of Object.getOwnPropertyNames(arg)) {
      if (["length", "name", "prototype"].includes(key)) continue;
      const desc = Object.getOwnPropertyDescriptor(arg, key);
      if (desc) {
        Object.defineProperty(newClass, key, desc);
      }
    }
    for (let key of Object.getOwnPropertyNames(arg.prototype)) {
      if (["constructor"].includes(key)) continue;
      const desc = Object.getOwnPropertyDescriptor(arg.prototype, key);
      if (desc) {
        Object.defineProperty(newClass.prototype, key, desc);
      }
    }
  }
  return newClass;
};
