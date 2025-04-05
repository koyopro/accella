import { Model } from "../index.js";
import { Meta } from "../meta.js";

export class Seedable {
  static seed<T extends typeof Model>(
    this: T,
    ...inputs: Meta<T>["CreateInput"][]
  ): InstanceType<T>[] {
    const primaryAttributes = this.primaryKeys.map((k) => this.columnToAttribute(k) || "");
    return this.seedBy(primaryAttributes, ...inputs);
  }

  static seedBy<T extends typeof Model>(
    this: T,
    attributes: string[],
    ...inputs: Meta<T>["CreateInput"][]
  ): InstanceType<T>[] {
    const results: InstanceType<T>[] = [];
    Model.transaction(() => {
      for (const input of inputs) {
        const pk = Object.fromEntries(
          Object.entries(input).filter(([key]) => attributes.includes(key))
        );
        const instance = this.findOrInitializeBy(pk);
        console.log(`- ${this.name} ${JSON.stringify(input)}`);
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
