import { Model } from "accel-record-core";

type BuildParams<T extends typeof Model> = Parameters<typeof Model.build<T>>[0];

export const defineFactory = <T extends typeof Model>(
  model: T,
  defaults: BuildParams<T> | ((opt: { seq: number }) => BuildParams<T>)
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
    create(params: BuildParams<T> = {}): ReturnType<typeof Model.create<T>> {
      return model.create({ ...devalueValues(), ...params } as any);
    },
    build(params: BuildParams<T> = {}): ReturnType<typeof Model.build<T>> {
      return model.build({ ...devalueValues(), ...params });
    },
    createList(count: number, params: BuildParams<T> = {}) {
      return Array.from({ length: count }, () =>
        this.create({ ...defaults, ...params })
      );
    },
    buildList(count: number, params: BuildParams<T> = {}) {
      return Array.from({ length: count }, () =>
        this.build({ ...defaults, ...params })
      );
    },
  };
};
