import { Models, type Model } from "../index.js";
import { BelongsToAssociation } from "./belongsToAssociation.js";
import { Collection } from "./collectionProxy.js";
import { HasManyAssociation } from "./hasManyAssociation.js";
import { HasManyThroughAssociation } from "./hasManyThroughAssociation.js";
import { HasOneAssociation } from "./hasOneAssociation.js";

export class ModelInstanceBuilder {
  static build<T extends typeof Model>(klass: T, input: any): InstanceType<T> {
    const instance = new klass() as InstanceType<T>;
    instance.isNewRecord = true;
    const proxy = ModelInstanceBuilder.createProxy<T>(instance, klass);
    for (const field of klass.columnFields) {
      if (!(field.name in instance)) {
        proxy[field.name] = field.getInitialValue();
      }
      if (field.name in input) {
        proxy[field.name] = input[field.name];
      }
    }
    this.initAssociations<T>(klass, instance);
    // Updating fields other than the column field
    Object.keys(input).forEach((key) => {
      if (klass.attributeToColumn(key) == undefined) {
        proxy[key] = input[key];
      }
    });
    return proxy;
  }

  private static createProxy<T extends typeof Model>(instance: any, klass: T) {
    return new Proxy(instance, {
      get(target: any, prop, receiver) {
        const column = klass.attributeToColumn(prop as string);
        if (typeof column === "string") {
          return target[column];
        }
        const association = target.associations.get(prop as string);
        if (
          association instanceof HasOneAssociation ||
          association instanceof BelongsToAssociation
        ) {
          return association.reader();
        }
        return Reflect.get(target, prop, receiver);
      },
      set(target, prop, value, receiver) {
        const column = klass.attributeToColumn(prop as string);
        if (typeof column === "string") {
          target[column] = value;
          return true;
        }
        const association = target.associations.get(prop as string);
        if (
          association instanceof HasOneAssociation ||
          association instanceof BelongsToAssociation
        ) {
          association.setter(value);
        }
        if (target[prop] instanceof Collection && Array.isArray(value)) {
          target[prop].replace(value);
          return true;
        }
        target[prop] = value;
        return true;
      },
    });
  }

  private static initAssociations<T extends typeof Model>(
    klass: T,
    obj: Model
  ) {
    for (const [key, info] of Object.entries(klass.associations)) {
      if (info.isHasOne) {
        obj.associations.set(key, new HasOneAssociation(obj, info));
      }
      if (info.isBelongsTo) {
        obj.associations.set(key, new BelongsToAssociation(obj, info));
      }
      if (info.field.isList) {
        const association = info.through
          ? new HasManyThroughAssociation(obj, info)
          : new HasManyAssociation(obj, info);
        obj.associations.set(key, association);

        const hasAllPrimaryKeys = obj.primaryKeys.every((k) => (obj as any)[k]);
        (obj as any)[key] = new Collection(
          Models[info.klass],
          association,
          hasAllPrimaryKeys ? undefined : []
        );
      }
    }
  }
}
