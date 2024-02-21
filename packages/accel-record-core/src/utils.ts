type InstanceTypeIntersection<T extends any[]> = T extends [
  infer Head extends abstract new (...args: any) => any,
  ...infer Tail extends (abstract new (...args: any) => any)[],
]
  ? InstanceType<Head> & InstanceTypeIntersection<Tail>
  : {};

type ObjectIntersection<T extends any[]> = T extends [
  infer Head extends abstract new (...args: any) => any,
  ...infer Tail extends (abstract new (...args: any) => any)[],
]
  ? { [K in keyof Head]: Head[K] } & ObjectIntersection<Tail>
  : {};

export const classIncludes = <T extends (new (...args: any) => any)[]>(
  ...args: T
): { new (): InstanceTypeIntersection<T> } & ObjectIntersection<T> => {
  const newClass: any = class {};
  for (let arg of args) {
    for (let key of Object.getOwnPropertyNames(arg)) {
      if (["length", "name", "prototype"].includes(key)) continue;
      assign(newClass, arg, key);
    }
    for (let key of Object.getOwnPropertyNames(arg.prototype)) {
      if (["constructor"].includes(key)) continue;
      assign(newClass.prototype, arg.prototype, key);
    }
    const obj = new arg();
    for (let key of Object.getOwnPropertyNames(obj)) {
      assign(newClass.prototype, obj, key);
    }
  }
  return newClass;
};

const assign = (target: object, source: object, key: string) => {
  const desc = Object.getOwnPropertyDescriptor(source, key);
  if (desc) {
    Object.defineProperty(target, key, desc);
  }
};
