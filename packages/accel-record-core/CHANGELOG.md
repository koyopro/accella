# accel-record-core

## 2.0.1

### Patch Changes

- [#121](https://github.com/koyopro/accella/pull/121) [`6014c2b`](https://github.com/koyopro/accella/commit/6014c2b7a7f21b5899b96e0acf2270ecd8f03b46) Thanks [@koyopro](https://github.com/koyopro)! - Changed to use `sourceFilePath` for calculating `datasourceUrl`. This fix resolves an issue where enabling `prismaSchemaFolder` and specifying a relative path for the SQLite datasource URL would cause a mismatch between the generated database file and the reference path.

- [#119](https://github.com/koyopro/accella/pull/119) [`89cb887`](https://github.com/koyopro/accella/commit/89cb88792de7005749bf807d2a5df28ac2cb7b3b) Thanks [@koyopro](https://github.com/koyopro)! - Adjusted to match the changes in the schemaDir of prisma-generator-accel-record.
