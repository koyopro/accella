import { Model } from "../index.js";
import { Association as Info } from "../fields";

export class Association<T extends Model> {
  constructor(
    protected owner: T,
    protected info: Info
  ) {}

  whereAttributes(): Record<string, any> {
    return { wheres: [this.scopeAttributes()] };
  }

  scopeAttributes() {
    return {
      [this.info.foreignKey]: this.owner[this.info.primaryKey as keyof T],
    };
  }

  protected get connection() {
    return (this.owner.constructor as typeof Model).connection;
  }
}
