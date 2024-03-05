import { CollectionProxy } from "../associations/collectionProxy.js";
import { Models, type Model } from "../index.js";
import { HasManyAssociation } from "./hasManyAssociation";
import { HasManyThroughAssociation } from "./hasManyThroughAssociation";

export class AssociationsBuilder {
  static build<T extends Model>(klass: T, instance: any, input: any): T {
    const proxy = AssociationsBuilder.createProxy<T>(instance, klass);
    for (const column of klass.columns2) {
      if (column.columnDefault !== undefined) {
        proxy[column.name] = column.columnDefault;
      }
      if (column.name in input) {
        proxy[column.name] = input[column.name];
      }
    }
    this.initValues<T>(klass, input, proxy, instance);
    return proxy;
  }

  private static createProxy<T extends Model>(instance: any, klass: T) {
    return new Proxy(instance, {
      get(target: any, prop, receiver) {
        const column = klass.columnsMapping[prop as string];
        if (typeof column === "string") {
          return target[column];
        }
        const association = klass.associations[prop as any];
        if (association?.isHasOne) {
          return (target[prop] ||= Models[association.klass].findBy({
            [association.foreignKey]: target[association.primaryKey],
          }));
        }
        if (association?.isBelongsTo) {
          return (target[prop] ||= Models[association.klass].findBy({
            [association.primaryKey]: target[association.foreignKey],
          }));
        }
        return Reflect.get(...arguments);
      },
      set(target, prop, value, receiver) {
        const column = klass.columnsMapping[prop as string];
        if (typeof column === "string") {
          target[column] = value;
          return true;
        }
        const association = klass.associations[prop as any];
        if (association?.isHasOne && target[association.primaryKey]) {
          if (value == undefined) {
            target[prop]?.destroy();
          } else {
            value[association.foreignKey] = target[association.primaryKey];
            value.save();
          }
        }
        if (association?.isBelongsTo) {
          target[association.foreignKey] = value[association.primaryKey];
        }
        target[prop] = value;
        return true;
      },
    });
  }

  private static initValues<T extends Model>(
    klass: T,
    input: any,
    proxy: any,
    instance: any
  ) {
    for (const [key, association] of Object.entries(klass.associations)) {
      const { klass, foreignKey, primaryKey, field } = association;
      if (!field.isList && key in input) {
        proxy[key] = input[key];
      } else if (field.isList || key in input) {
        let _association: HasManyAssociation<T> | HasManyThroughAssociation<T>;
        if (association.through) {
          _association = new HasManyThroughAssociation(instance, association);
        } else {
          _association = new HasManyAssociation(instance, association);
        }
        instance[key] = new CollectionProxy(
          Models[klass],
          _association,
          input[key] ?? (instance.isPersisted() ? undefined : [])
        );
      }
    }
  }
}
