import { ModelMeta } from "../meta.js";
import { Relation } from "./index.js";

export class Batches {
  findInBatches<T, M extends ModelMeta>(
    this: Relation<T, M>,
    options: { batchSize?: number },
    callback: (records: T[]) => void
  ) {
    const limit = options.batchSize ?? 1000;
    let offset = 0;
    while (true) {
      const records = this.limit(limit).offset(offset).load();
      if (records.length == 0) break;
      callback(records);
      offset += limit;
    }
  }
}
