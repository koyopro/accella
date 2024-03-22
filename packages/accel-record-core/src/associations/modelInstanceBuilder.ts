import { Models, type Model } from "../index.js";
import { BelongsToAssociation } from "./belongsToAssociation.js";
import { Collection } from "./collectionProxy.js";
import { HasManyAssociation } from "./hasManyAssociation.js";
import { HasManyThroughAssociation } from "./hasManyThroughAssociation.js";
import { HasOneAssociation } from "./hasOneAssociation.js";

export class ModelInstanceBuilder {
  static build<T extends typeof Model>(klass: T, input: any): InstanceType<T> {
    const instance = new klass();
    instance.isNewRecord = true;
    const proxy = ModelInstanceBuilder.createProxy<T>(instance, klass);
    for (const column of klass.columns2) {
      if (!(column.name in instance)) {
        proxy[column.name] = column.getInitialValue();
      }
      if (column.name in input) {
        proxy[column.name] = input[column.name];
      }
    }
    this.initValues<T>(klass, input, proxy, instance);
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
        if (association instanceof HasOneAssociation) {
          return association.reader();
        }
        if (association instanceof BelongsToAssociation) {
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
        if (association instanceof HasOneAssociation) {
          association.setter(value);
        }
        if (association instanceof BelongsToAssociation) {
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

  private static initValues<T extends typeof Model>(
    klass: T,
    input: any,
    proxy: any,
    instance: any
  ) {
    for (const [key, association] of Object.entries(klass.associations)) {
      const { klass, foreignKey, primaryKey, field } = association;
      if (association.isHasOne) {
        (instance.associations as Map<string, any>).set(
          key,
          new HasOneAssociation(instance, association)
        );
      }
      if (association.isBelongsTo) {
        (instance.associations as Map<string, any>).set(
          key,
          new BelongsToAssociation(instance, association)
        );
      }
      if (!field.isList && key in input) {
        proxy[key] = input[key];
      } else if (field.isList || key in input) {
        let _association:
          | HasManyAssociation<Model>
          | HasManyThroughAssociation<Model>;
        if (association.through) {
          _association = new HasManyThroughAssociation(instance, association);
        } else {
          _association = new HasManyAssociation(instance, association);
        }
        const hasAllPrimaryKeys = () =>
          instance.primaryKeys.every((k: keyof typeof instance) => instance[k]);
        instance[key] = new Collection(
          Models[klass],
          _association,
          input[key] ?? (hasAllPrimaryKeys() ? undefined : [])
        );
        (instance.associations as Map<string, any>).set(key, _association);
      }
    }
  }
}
