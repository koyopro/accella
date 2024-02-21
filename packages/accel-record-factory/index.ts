type BuildParams<T extends { build: any }> = Partial<Parameters<T["build"]>[0]>;

export const defineFactory = <
  T extends { create: any; build: any } & { new (...args: any[]): any },
  P extends BuildParams<T>
>(
  model: T,
  defaults: P | ((opt: { seq: number }) => P)
) => {
  let seq = 0;
  const devalueValues = () => {
    if (typeof defaults == "function") {
      return defaults({ seq: ++seq });
    } else {
      return defaults;
    }
  };
  return {
    create(params: BuildParams<T> = {}): ReturnType<T["create"]> {
      return model.create({ ...devalueValues(), ...params } as any);
    },
    build(params: BuildParams<T> = {}): ReturnType<T["build"]> {
      return model.build({ ...devalueValues(), ...params });
    },
    createList(count: number, params: BuildParams<T> = {}) {
      return Array.from({ length: count }, () =>
        this.create({ ...defaults, ...params })
      );
    },
  };
};
