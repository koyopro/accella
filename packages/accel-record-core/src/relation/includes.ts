import { Model, Models } from "../index.js";
import { Association } from "../model/association.js";

export class IncludesLoader {
  constructor(
    protected model: typeof Model,
    protected rows: any[],
    protected association: Association
  ) {}

  load() {
    if (this.association.isBelongsTo) {
      this.loadBelongsToIncludes();
    } else if (this.association.through) {
      this.loadHasManyThroughIncludes();
    } else if (this.association.primaryKeyColumns.length >= 2) {
      this.loadCompositeIdsIncludes();
    } else {
      const { klass, primaryKey, foreignKey } = this.association;
      const name = this.association.field.name;
      const primaryKeys = this.rows.map((row: any) => row[primaryKey]);
      const attribute = Models[klass].columnToAttribute(foreignKey)!;
      const included = Models[klass].where({ [attribute]: primaryKeys });
      const mapping: any = {};
      for (const row of included) {
        (mapping[(row as any)[foreignKey]] ||= []).push(row);
      }
      for (const row of this.rows) {
        row[name] = mapping[row[primaryKey]] ?? [];
      }
    }
  }

  private loadCompositeIdsIncludes() {
    const { klass, primaryKeyColumns, foreignKeyColumns } = this.association;
    const relation = this.rows.reduce((relation, row) => {
      const where = foreignKeyColumns.toHash((pk, i) => [
        Models[klass].columnToAttribute(pk)!,
        row[primaryKeyColumns[i]],
      ]);
      return relation.or(where);
    }, Models[klass].all());
    const mapping: any = {};
    for (const row of relation) {
      const key = foreignKeyColumns.map((pk) => row[pk]).join("__");
      (mapping[key] ||= []).push(row);
    }
    const name = this.association.field.name;
    for (const row of this.rows) {
      const key = primaryKeyColumns.map((pk) => row[pk]).join("__");
      row[name] = mapping[key] ?? [];
    }
  }

  private loadHasManyThroughIncludes() {
    const { primaryKey, foreignKey, joinKey } = this.association;
    const name = this.association.field.name;
    const primaryKeys = this.rows.map((row: any) => row[primaryKey]);

    const relations = this.model.connection
      .knex(this.association.through)
      .where(foreignKey, "in", primaryKeys)
      .execute();

    const includedMap = this.makeIncludedMapOfHasManyThrough(relations);

    const mapping: any = {};
    for (const row of relations) {
      (mapping[row[foreignKey]] ||= []).push(includedMap[row[joinKey]]);
    }
    for (const row of this.rows) {
      row[name] = mapping[row[primaryKey]] ?? [];
    }
  }

  private makeIncludedMapOfHasManyThrough(relations: any[]) {
    const { klass, joinKey } = this.association;
    const targetModel = Models[klass];
    const pk = targetModel.primaryKeys[0];
    const attribute = targetModel.columnToAttribute(pk)!;
    const included = targetModel.where({
      [attribute]: relations.map((r) => r[joinKey]),
    });
    const includedMap: any = {};
    for (const row of included) {
      includedMap[(row as any)[pk]] = row;
    }
    return includedMap;
  }

  protected loadBelongsToIncludes() {
    if (this.association.primaryKeyColumns.length >= 2)
      return this.loadCompositeIdsBelongsToIncludes();

    const { klass, primaryKeyColumns, foreignKeyColumns } = this.association;
    const name = this.association.field.name;
    const primaryKey = primaryKeyColumns[0];
    const foreignKey = foreignKeyColumns[0];
    const foreignKeys = this.rows.map((row: any) => row[foreignKey]);
    const mapping: any = {};
    const attribute = Models[klass].columnToAttribute(primaryKey)!;
    const included = Models[klass].where({ [attribute]: foreignKeys });
    for (const row of included) {
      mapping[(row as any)[primaryKey]] = row;
    }
    for (const row of this.rows) {
      row[name] = mapping[row[foreignKey]];
    }
  }

  protected loadCompositeIdsBelongsToIncludes() {
    const { klass, primaryKeyColumns, foreignKeyColumns } = this.association;
    const relation = this.rows.reduce((relation, row) => {
      const where = primaryKeyColumns.toHash((pk, i) => [
        Models[klass].columnToAttribute(pk)!,
        row[foreignKeyColumns[i]],
      ]);
      return relation.or(where);
    }, Models[klass].all());
    const mapping = relation.toArray().toHash((row: any) => {
      const key = primaryKeyColumns.map((pk) => row[pk]).join("__");
      return [key, row];
    });
    const name = this.association.field.name;
    for (const row of this.rows) {
      const key = foreignKeyColumns.map((pk) => row[pk]).join("__");
      row[name] = mapping[key];
    }
  }
}
