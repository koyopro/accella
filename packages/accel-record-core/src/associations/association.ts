import { Model } from "../index.js";
import { Association as Info } from "../fields";

export class Association<T extends Model> {
  constructor(
    protected owner: T,
    protected info: Info
  ) {}
}
