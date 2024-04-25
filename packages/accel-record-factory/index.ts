import { Meta, Model } from "accel-record-core";

type Functionable<T> = {
  [K in keyof T]: T[K] | ((seq?: number) => T[K]);
};
type FunctionableUnion<D> = D extends infer T
  ? Functionable<Extract<D, T>>
  : never;

export type BuildParams<T extends typeof Model> = Partial<
  FunctionableUnion<Meta<T>["CreateInput"]>
>;

export const defineFactory = <T extends typeof Model>(
  model: T,
  defaults: BuildParams<T> | ((opt: { seq: number }) => BuildParams<T>)
) => {
  let seq = 0;
  const callIfFunc = (arg: any) =>
    typeof arg === "function" ? arg(++seq) : arg;
  const getValues = (params: BuildParams<T>) => {
    const ret = {} as any;
    for (const [key, value] of Object.entries({
      ...callIfFunc(defaults),
      ...params,
    })) {
      ret[key] = callIfFunc(value);
    }
    return ret;
  };
  return {
    create(params: BuildParams<T> = {}): ReturnType<typeof Model.create<T>> {
      return model.create(getValues(params));
    },
    build(params: BuildParams<T> = {}): ReturnType<typeof Model.build<T>> {
      return model.build(getValues(params));
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
