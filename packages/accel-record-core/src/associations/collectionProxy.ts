import { Meta, type Model } from "../index.js";
import { Relation } from "../relation.js";

export class CollectionProxy<T, S extends Meta> extends Relation<T, S> {}
