type WithoutConstructor<T> = {
  [P in keyof T]: T[P];
};

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
  ? WithoutConstructor<Head> & ObjectIntersection<Tail>
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
    getStaticProperties(arg).forEach((klass, key) => {
      assign(newClass, klass, key);
    });
    getInstanceMethods(arg).forEach((proto, key) => {
      assign(newClass.prototype, proto, key);
    });
  }
  return newClass;
};

const assign = (target: object, source: object, key: string) => {
  const desc = Object.getOwnPropertyDescriptor(source, key);
  if (desc) {
    Object.defineProperty(target, key, desc);
  }
};

const getInstanceMethods = <T>(arg: new (...args: any[]) => T) => {
  const properties = new Map<string, any>();
  let currentProto = arg.prototype;

  while (currentProto && currentProto !== Object.prototype) {
    Object.getOwnPropertyNames(currentProto).forEach((prop) => {
      const descriptor = Object.getOwnPropertyDescriptor(currentProto, prop);
      if (prop != "constructor" && descriptor) {
        properties.set(prop, currentProto);
      }
    });
    currentProto = Object.getPrototypeOf(currentProto);
  }

  return properties;
};

const getStaticProperties = <T extends Function>(cls: T) => {
  const properties = new Map<string, any>();
  let currentCls = cls;

  while (currentCls) {
    Object.getOwnPropertyNames(currentCls).forEach((prop) => {
      if (
        prop !== "constructor" &&
        prop !== "prototype" &&
        prop !== "length" &&
        prop !== "name"
      ) {
        properties.set(prop, currentCls);
      }
    });

    currentCls = Object.getPrototypeOf(currentCls);
    if (currentCls === Function.prototype) {
      break;
    }
  }

  return properties;
};
