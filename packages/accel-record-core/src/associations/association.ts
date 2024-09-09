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
    return this.info.foreignKeyColumns.toHash((col, i) => [
      col,
      this.owner[this.info.primaryKeyColumns[i] as keyof O],
    ]);
  }

  build(attributes: Record<string, any>) {
    this.target = this.info.model.build(attributes) as T;
    this.target.assignAttributes(this.scopeAttributes());
    return this.target;
  }

  create(attributes: Record<string, any>) {
    this.build(attributes);
    this.target?.save();
    return this.target;
  }

  get ownerHasPrimary() {
    return this.info.primaryKeyColumns.every((col) => this.owner[col as keyof O] !== undefined);
  }

  protected get connection() {
    return (this.owner.constructor as typeof Model).connection;
  }
}
