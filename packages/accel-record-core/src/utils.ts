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

/**
 * Combines multiple classes into a new class that includes the properties and methods of all the classes.
 *
 * The first argument becomes the base class, and the properties and methods of the subsequent classes are inherited by the new class.
 * If there are methods with the same name, the method of the base class is called first, followed by the methods of the subsequent classes, and the last result is returned.
 *
 * @param classes - The classes to be combined.
 * @returns A new class that includes the properties and methods of all the input classes.
 * @example
 * class A {
 *   static a = 1;
 *   methodA() {
 *    return 2;
 *   }
 * }
 * class B {
 *   b = 3;
 * }
 * class C extends Mix(A, B) {}
 * C.a; // 1
 * const c = new C();
 * c.methodA(); // 2
 * c.b; // 3
 */
export const Mix = <T extends (new (...args: any) => any)[]>(
  ...classes: T
): { new (): InstanceTypeIntersection<T> } & ObjectIntersection<T> => {
  const BaseClass = classes[0];
  const classList = classes.slice(1);
  const newClass: any = class extends BaseClass {
    constructor() {
      super();
      for (const cls of classList) {
        const obj = new cls();
        for (const key of Object.getOwnPropertyNames(obj)) {
          assign(this, obj, key);
        }
      }
    }
  };
  for (let cls of classList) {
    getStaticProperties(cls).forEach((klass, key) => {
      assign(newClass, klass, key);
    });
    getInstanceMethods(cls).forEach((proto, key) => {
      assign(newClass.prototype, proto, key);
    });
  }
  return newClass;
};

const findMethod = (target: object, key: string) => {
  let proto = target;
  while (proto && proto !== Object.prototype) {
    const desc = Object.getOwnPropertyDescriptor(proto, key);
    if (desc) return desc;
    proto = Object.getPrototypeOf(proto);
  }
  return undefined;
};

const assign = (target: object, source: object, key: string) => {
  const desc = Object.getOwnPropertyDescriptor(source, key);
  const targetDesc = findMethod(target, key);

  if (
    typeof targetDesc?.value == "function" &&
    typeof desc?.value == "function"
  ) {
    // already has a method, so we need to wrap it
    Object.defineProperty(target, key, {
      value: function (this: any, ...args: any[]) {
        targetDesc.value.apply(this, args);
        return desc.value.apply(this, args);
      },
      enumerable: targetDesc.enumerable,
      writable: true,
      configurable: true,
    });
  } else if (desc) {
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
