import { ModelMeta } from "../meta.js";
import { Relation } from "./index.js";

export class Batches {
  /**
   * Iterates over the relation in batches, loading a specified number of records at a time.
   * @param options.batchSize - The number of records to load in each batch. Defaults to 1000.
   * @returns - An iterator object that allows iterating over the relation in batches.
   */
  findEach<T, M extends ModelMeta>(
    this: Relation<T, M>,
    options?: { batchSize?: number }
  ) {
    return {
      [Symbol.iterator]: () => {
        const limit = options?.batchSize ?? 1000;
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
  /**
   * Iterates over the records in batches, allowing you to process a large number of records in smaller chunks.
   *
   * @param options.batchSize - The size of each batch. Defaults to 1000 if not provided.
   * @returns An iterator object that provides the records in batches.
   */
  findInBatches<T, M extends ModelMeta>(
    this: Relation<T, M>,
    options?: { batchSize?: number }
  ) {
    return {
      [Symbol.iterator]: () => {
        const limit = options?.batchSize ?? 1000;
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
