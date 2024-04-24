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
  ? Head & ObjectIntersection<Tail>
  : {};

export const classIncludes = <T extends (new (...args: any) => any)[]>(
  ...args: T
): { new (): InstanceTypeIntersection<T> } & ObjectIntersection<T> => {
  const newClass: any = class {
    constructor() {
      for (const arg of args) {
        const obj = new arg();
        for (const key of Object.getOwnPropertyNames(obj)) {
          assign(this, obj, key);
        }
      }
    }
  };
  for (let arg of args) {
    for (let key of Object.getOwnPropertyNames(arg)) {
      if (["length", "name", "prototype"].includes(key)) continue;
      assign(newClass, arg, key);
    }
    for (let key of Object.getOwnPropertyNames(arg.prototype)) {
      if (["constructor"].includes(key)) continue;
      assign(newClass.prototype, arg.prototype, key);
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
