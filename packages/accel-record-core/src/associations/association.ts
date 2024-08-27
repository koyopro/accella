import { Model } from "../index.js";
import { Association as Info } from "../model/association.js";

export class Association<O extends Model, T extends Model> {
  protected target: T | undefined = undefined;
  protected isLoaded: boolean = false;

  constructor(
    protected owner: O,
    protected info: Info
  ) {}

  reset() {
    this.target = undefined;
    this.isLoaded = false;
  }

  whereAttributes(): Record<string, any> {
    return { wheres: [this.scopeAttributes()] };
  }

  scopeAttributes() {
    const ret: any = {};
    for (let i = 0; i < this.info.foreignKeyColumns.length; i++) {
      ret[this.info.foreignKeyColumns[i]] = this.owner[this.info.primaryKeyColumns[i] as keyof O];
    }
    return ret;
  }

  get ownerHasPrimary() {
    return this.info.primaryKeyColumns.every((col) => this.owner[col as keyof O] !== undefined);
  }

  protected get connection() {
    return (this.owner.constructor as typeof Model).connection;
  }
}
