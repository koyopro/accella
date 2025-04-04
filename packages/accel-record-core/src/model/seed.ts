import { Model } from "../index.js";
import { Meta } from "../meta.js";

export class Seedable {
  static seed<T extends typeof Model>(
    this: T,
    ...inputs: Meta<T>["CreateInput"][]
  ): InstanceType<T>[] {
    const results: InstanceType<T>[] = [];
    Model.transaction(() => {
      for (const input of inputs) {
        const pk = Object.fromEntries(
          Object.entries(input).filter(([key]) =>
            this.primaryKeys.includes(this.attributeToColumn(key) || "")
          )
        );
        const instance = this.findOrInitializeBy(pk);
        if (instance.update(input)) {
          results.push(instance as any);
        } else {
          throw new Error(`Failed to seed: ${(instance as Model).errors.fullMessages}`);
        }
      }
    });
    return results;
  }
}
