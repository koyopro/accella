# prisma-generator-accel-record

## 2.1.0

### Minor Changes

- [#150](https://github.com/koyopro/accella/pull/150) [`d4ead34`](https://github.com/koyopro/accella/commit/d4ead3452287fb15940d6b90d41856471f0e4c89) Thanks [@koyopro](https://github.com/koyopro)! - Setter methods marked with `attribute` decorator will be included in the type definition and can be used as arguments for methods like create or update.

## 2.0.3

### Patch Changes

- [#142](https://github.com/koyopro/accella/pull/142) [`9610569`](https://github.com/koyopro/accella/commit/9610569d6e03dcfad4fef07ece4c617825bc262b) Thanks [@koyopro](https://github.com/koyopro)! - Fix: Include json type columns in the Column

- [#144](https://github.com/koyopro/accella/pull/144) [`5736ab4`](https://github.com/koyopro/accella/commit/5736ab4e9ce439605391586e7e873abbf67d6b4d) Thanks [@koyopro](https://github.com/koyopro)! - Added @ts-nocheck comment to \_types.ts

## 2.0.2

### Patch Changes

- [#124](https://github.com/koyopro/accella/pull/124) [`ac10d13`](https://github.com/koyopro/accella/commit/ac10d131301ec3aa94c95788b413a8d87ac5da6d) Thanks [@koyopro](https://github.com/koyopro)! - Adjusted the resolution method of factoryDir in generateFactories()

## 2.0.1

### Patch Changes

- [#119](https://github.com/koyopro/accella/pull/119) [`89cb887`](https://github.com/koyopro/accella/commit/89cb88792de7005749bf807d2a5df28ac2cb7b3b) Thanks [@koyopro](https://github.com/koyopro)! - Fixed an issue where the schemaDir was one level deeper than necessary.

- [#121](https://github.com/koyopro/accella/pull/121) [`6014c2b`](https://github.com/koyopro/accella/commit/6014c2b7a7f21b5899b96e0acf2270ecd8f03b46) Thanks [@koyopro](https://github.com/koyopro)! - The `sourceFilePath` is now output separately from `schemaDir` and is used in `generateDatabaseConfig()`.

## 2.0.0

### Major Changes

- [#103](https://github.com/koyopro/accella/pull/103) [`45c69e3`](https://github.com/koyopro/accella/commit/45c69e3df5e040b5eb574b6c6509320e0641f5b5) Thanks [@koyopro](https://github.com/koyopro)! - Update dependencies to use accel-record-core 2.0

## 1.18.1

### Patch Changes

- [#91](https://github.com/koyopro/accella/pull/91) [`bfc9af8`](https://github.com/koyopro/accella/commit/bfc9af847b254b9356e731320355e778261057f2) Thanks [@koyopro](https://github.com/koyopro)! - Disable sync-actions launch to prevent the process from hanging

## 1.18.0

### Minor Changes

- [#86](https://github.com/koyopro/accella/pull/86) [`8ced350`](https://github.com/koyopro/accella/commit/8ced3503e1178292eeef5beea4254258f52faea6) Thanks [@koyopro](https://github.com/koyopro)! - Support Prisma 6.0
