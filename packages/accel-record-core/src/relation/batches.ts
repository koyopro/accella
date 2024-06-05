import { ModelMeta } from "../meta.js";
import { Relation } from "./index.js";

export class Batches {
  findEach<T, M extends ModelMeta>(
    this: Relation<T, M>,
    options: { batchSize?: number }
  ) {
    return {
      [Symbol.iterator]: () => {
        const limit = options.batchSize ?? 1000;
        let offset = 0;
        let count = 0;
        let cache: T[] = [];
        return {
          next: () => {
            if (cache.length <= count) {
              cache = this.limit(limit).offset(offset).load();
              count = 0;
              offset += limit;
            }
            return {
              done: cache.length == 0,
              value: cache[count++],
            };
          },
        };
      },
    };
  }
  findInBatches<T, M extends ModelMeta>(
    this: Relation<T, M>,
    options: { batchSize?: number }
  ) {
    return {
      [Symbol.iterator]: () => {
        const limit = options.batchSize ?? 1000;
        let offset = 0;
        return {
          next: () => {
            const records = this.limit(limit).offset(offset).load();
            offset += limit;
            return {
              done: records.length == 0,
              value: records,
            };
          },
        };
      },
    };
  }
}
