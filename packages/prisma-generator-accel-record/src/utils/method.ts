export const getInstanceMethods = <T>(arg: new (...args: any[]) => T) => {
  const properties = new Map<string, any>();
  let currentProto = arg.prototype;

  while (currentProto && currentProto !== Object.prototype) {
    Object.getOwnPropertyNames(currentProto).forEach((prop) => {
      const descriptor = Object.getOwnPropertyDescriptor(currentProto, prop);
      if (prop != "constructor" && descriptor) {
        properties.set(prop, descriptor);
      }
    });
    currentProto = Object.getPrototypeOf(currentProto);
  }

  return properties;
};
