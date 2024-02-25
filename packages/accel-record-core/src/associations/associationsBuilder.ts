import { Models, type Model } from "../index.js";
import { CollectionProxy } from "../associations/collectionProxy.js";

export class AssociationsBuilder {
  static build<T extends Model>(klass: T, instance: any, input: any): T {
    const proxy = AssociationsBuilder.createProxy<T>(instance, klass);
    this.initValues<T>(klass, input, proxy, instance);
    return proxy;
  }

  private static createProxy<T extends Model>(instance: any, klass: T) {
    return new Proxy(instance, {
      get(target: any, prop, receiver) {
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
        const association = klass.associations[prop as any];
        if (association?.isHasOne && target[association.primaryKey]) {
          if (value == undefined) {
            target[prop]?.destroy();
          } else {
            value[association.foreignKey] = target[association.primaryKey];
            value.save();
          }
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
        const option = { wheres: [{ [foreignKey]: instance[primaryKey] }] };
        instance[key] = new CollectionProxy(
          Models[klass],
          option,
          input[key] ?? (instance.isPersisted() ? undefined : [])
        );
      }
    }
  }
}
