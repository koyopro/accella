import { Meta, Model } from "accel-record-core";

type Functionable<T> = {
  [K in keyof T]: T[K] | ((seq?: number) => T[K]);
};
type FunctionableUnion<D> = D extends infer T ? Functionable<Extract<D, T>> : never;

export type BuildParams<T extends typeof Model> = Partial<
  FunctionableUnion<Meta<T>["CreateInput"]>
>;

type BuildParamsCallable<T extends typeof Model> =
  | BuildParams<T>
  | ((opt: { seq: number }) => BuildParams<T>);

// eslint-disable-next-line max-lines-per-function
export const defineFactory = <
  T extends typeof Model,
  S extends { [key: string]: BuildParamsCallable<T> },
>(
  model: T,
  defaults: BuildParamsCallable<T>,
  options?: {
    traits?: S;
  }
) => {
  let seq = 0;
  type Trait = keyof S;
  const callIfFunc = (arg: any) => (typeof arg === "function" ? arg(++seq) : arg);
  const getValues = (params: BuildParams<T>, traits: Trait[]) => {
    const data = { ...callIfFunc(defaults) };
    for (const trait of traits) {
      Object.assign(data, callIfFunc(options?.traits?.[trait]));
    }
    Object.assign(data, params);
    const ret = {} as any;
    for (const [key, value] of Object.entries(data)) {
      ret[key] = callIfFunc(value);
    }
    return ret;
  };
  return {
    create(params: BuildParams<T> = {}, ...traits: Trait[]): ReturnType<typeof Model.create<T>> {
      return model.create(getValues(params, traits));
    },
    build(params: BuildParams<T> = {}, ...traits: Trait[]): ReturnType<typeof Model.build<T>> {
      return model.build(getValues(params, traits));
    },
    createList(count: number, params: BuildParams<T> = {}, ...traits: Trait[]) {
      return Array.from({ length: count }, () => this.create(params, ...traits));
    },
    buildList(count: number, params: BuildParams<T> = {}, ...traits: Trait[]) {
      return Array.from({ length: count }, () => this.build(params, ...traits));
    },
  };
};
