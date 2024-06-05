import { exec } from "../database.js";
import { ModelMeta } from "../meta.js";
import { Relation } from "./index.js";

/**
 * A class that provides various calculations on a relation.
 *
 * This class is intended to be inherited by the Relation class.
 */
export class Calculations {
  /**
   * Returns the number of records in the relation.
   * @returns The number of records in the relation.
   */
  count<T>(this: Relation<T, ModelMeta>): number {
    const res = exec(
      this.query().count(`${this.model.tableName}.${this.model.primaryKeys[0]}`)
    );
    return Number(Object.values(res[0])[0]);
  }

  /**
   * Returns the minimum value of the specified attribute.
   *
   * @param attribute - The attribute to find the minimum value for.
   * @returns The minimum value of the specified attribute.
   */
  minimum<T, M extends ModelMeta>(
    this: Relation<T, M>,
    attribute: keyof M["OrderInput"]
  ) {
    const res = exec(
      this.query().min(this.model.attributeToColumn(attribute as string))
    );
    return Number(Object.values(res[0])[0]);
  }

  /**
   * Returns the maximum value of the specified attribute.
   *
   * @param attribute - The attribute to find the maximum value for.
   * @returns The maximum value of the specified attribute.
   */
  maximum<T, M extends ModelMeta>(
    this: Relation<T, M>,
    attribute: keyof M["OrderInput"]
  ) {
    const res = exec(
      this.query().max(this.model.attributeToColumn(attribute as string))
    );
    return Number(Object.values(res[0])[0]);
  }

  /**
   * Calculates the average value of the specified attribute.
   *
   * @param attribute - The attribute to calculate the average for.
   * @returns The average value of the specified attribute.
   */
  average<T, M extends ModelMeta>(
    this: Relation<T, M>,
    attribute: keyof M["OrderInput"]
  ) {
    const res = exec(
      this.query().avg(this.model.attributeToColumn(attribute as string))
    );
    return Number(Object.values(res[0])[0]);
  }
}
