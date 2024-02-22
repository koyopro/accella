import { Meta, type Model } from "../index.js";
import { Relation } from "../relation.js";

export class CollectionProxy<
  T extends typeof Model,
  S extends Meta,
> extends Relation<T, S> {}
