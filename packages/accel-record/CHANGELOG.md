# Accel Record

## 2.1.0

### Minor Changes

- [#135](https://github.com/koyopro/accella/pull/135) [`38065c1`](https://github.com/koyopro/accella/commit/38065c137af90ec46ea9fcb3198d8d04dcbd0505) Thanks [@koyopro](https://github.com/koyopro)! - export deepMerge() function

### Patch Changes

- [#133](https://github.com/koyopro/accella/pull/133) [`2778ea3`](https://github.com/koyopro/accella/commit/2778ea3a4b5dcb8edd0090a50fcf96fb23ccbd9e) Thanks [@koyopro](https://github.com/koyopro)! - Restricted the argument type of Model.humanAttributeName()

- Updated dependencies [[`2778ea3`](https://github.com/koyopro/accella/commit/2778ea3a4b5dcb8edd0090a50fcf96fb23ccbd9e), [`38065c1`](https://github.com/koyopro/accella/commit/38065c137af90ec46ea9fcb3198d8d04dcbd0505)]:
  - accel-record-core@2.1.0

## 2.0.1

### Patch Changes

- [#121](https://github.com/koyopro/accella/pull/121) [`6014c2b`](https://github.com/koyopro/accella/commit/6014c2b7a7f21b5899b96e0acf2270ecd8f03b46) Thanks [@koyopro](https://github.com/koyopro)! - Changed to use `sourceFilePath` for calculating `datasourceUrl`. This fix resolves an issue where enabling `prismaSchemaFolder` and specifying a relative path for the SQLite datasource URL would cause a mismatch between the generated database file and the reference path.

- [#119](https://github.com/koyopro/accella/pull/119) [`89cb887`](https://github.com/koyopro/accella/commit/89cb88792de7005749bf807d2a5df28ac2cb7b3b) Thanks [@koyopro](https://github.com/koyopro)! - Adjusted to match the changes in the schemaDir of prisma-generator-accel-record.

- Updated dependencies [[`6014c2b`](https://github.com/koyopro/accella/commit/6014c2b7a7f21b5899b96e0acf2270ecd8f03b46), [`89cb887`](https://github.com/koyopro/accella/commit/89cb88792de7005749bf807d2a5df28ac2cb7b3b), [`89cb887`](https://github.com/koyopro/accella/commit/89cb88792de7005749bf807d2a5df28ac2cb7b3b), [`6014c2b`](https://github.com/koyopro/accella/commit/6014c2b7a7f21b5899b96e0acf2270ecd8f03b46)]:
  - accel-record-core@2.0.1
  - prisma-generator-accel-record@2.0.1

## 2.0.0

### Major Changes

- [#103](https://github.com/koyopro/accella/pull/103) [`af334db`](https://github.com/koyopro/accella/commit/af334dbc8d48ece791a73cfbbe87a850cf5f5be6) Thanks [@koyopro](https://github.com/koyopro)! - Changed the default synchronization worker type from child_process to worker_threads.

  - The conventional synchronization using `child_process` is still available, but using `worker_threads` improves performance.
  - To use synchronization with `child_process`, specify `sync: 'process'` in the arguments of `initAccelRecord()`.

- [#102](https://github.com/koyopro/accella/pull/102) [`3602db4`](https://github.com/koyopro/accella/commit/3602db4f59b08142e64c68dc1cb7443330cbb902) Thanks [@koyopro](https://github.com/koyopro)! - Set the default time zone to UTC when connecting to MySQL

  - For detailed specifications, please refer to the [README](https://github.com/koyopro/accella/blob/main/packages/accel-record/README.md#time-zone-for-datetime-columns).

### Minor Changes

- [#100](https://github.com/koyopro/accella/pull/100) [`7a9128d`](https://github.com/koyopro/accella/commit/7a9128d44f2ee6f3a994edb10659721f0ed67680) Thanks [@koyopro](https://github.com/koyopro)! - Reimplemented the processing related to Relation's where clause to support nested conditions.

### Patch Changes

- Updated dependencies [[`7a9128d`](https://github.com/koyopro/accella/commit/7a9128d44f2ee6f3a994edb10659721f0ed67680), [`3602db4`](https://github.com/koyopro/accella/commit/3602db4f59b08142e64c68dc1cb7443330cbb902), [`af334db`](https://github.com/koyopro/accella/commit/af334dbc8d48ece791a73cfbbe87a850cf5f5be6), [`45c69e3`](https://github.com/koyopro/accella/commit/45c69e3df5e040b5eb574b6c6509320e0641f5b5)]:
  - accel-record-core@2.0.0
  - accel-record-factory@2.0.0
  - prisma-generator-accel-record@2.0.0

## 1.21.0

### Minor Changes

- [#95](https://github.com/koyopro/accella/pull/95) [`1613a7b`](https://github.com/koyopro/accella/commit/1613a7b467e90d8e1b685df0b9d7266103e23287) Thanks [@koyopro](https://github.com/koyopro)! - Added a `sorts` property to the `Search` class.

### Patch Changes

- [#98](https://github.com/koyopro/accella/pull/98) [`089e8bb`](https://github.com/koyopro/accella/commit/089e8bbb38b637b26dcd96094c00d7e9b6c6f032) Thanks [@koyopro](https://github.com/koyopro)! - Merge arrays in Mix()

- Updated dependencies [[`1613a7b`](https://github.com/koyopro/accella/commit/1613a7b467e90d8e1b685df0b9d7266103e23287), [`089e8bb`](https://github.com/koyopro/accella/commit/089e8bbb38b637b26dcd96094c00d7e9b6c6f032)]:
  - accel-record-core@1.21.0

## 1.20.0

### Minor Changes

- [#94](https://github.com/koyopro/accella/pull/94) [`a60bdaa`](https://github.com/koyopro/accella/commit/a60bdaaecf2d34febf3e12b159fe13f658968adc) Thanks [@koyopro](https://github.com/koyopro)! - Added an interface to define validations for the Model as static properties

### Patch Changes

- Updated dependencies [[`bfc9af8`](https://github.com/koyopro/accella/commit/bfc9af847b254b9356e731320355e778261057f2), [`a60bdaa`](https://github.com/koyopro/accella/commit/a60bdaaecf2d34febf3e12b159fe13f658968adc)]:
  - prisma-generator-accel-record@1.18.1
  - accel-record-core@1.20.0

## 1.19.0

### Minor Changes

- [#86](https://github.com/koyopro/accella/pull/86) [`8ced350`](https://github.com/koyopro/accella/commit/8ced3503e1178292eeef5beea4254258f52faea6) Thanks [@koyopro](https://github.com/koyopro)! - Support Prisma 6.0

### Patch Changes

- Updated dependencies [[`8ced350`](https://github.com/koyopro/accella/commit/8ced3503e1178292eeef5beea4254258f52faea6)]:
  - prisma-generator-accel-record@1.18.0
  - accel-record-core@1.19.0

## 1.18.0

### Minor Changes

- [#84](https://github.com/koyopro/accella/pull/84) [`526469d`](https://github.com/koyopro/accella/commit/526469de8dd3babf018e718454a3a1e69c1da44b) Thanks [@koyopro](https://github.com/koyopro)! - Added the sync-actions package and implemented synchronous query execution using worker threads.

### Patch Changes

- Updated dependencies [[`526469d`](https://github.com/koyopro/accella/commit/526469de8dd3babf018e718454a3a1e69c1da44b)]:
  - accel-record-core@1.18.0

## 1.17.1

### Patch Changes

- [#81](https://github.com/koyopro/accella/pull/81) [`84af669`](https://github.com/koyopro/accella/commit/84af669c2735e1766fec790de1d0cf4bbc2a2f88) Thanks [@koyopro](https://github.com/koyopro)! - Fixed an issue where calling defineEnumTextAttribute() multiple times with the same arguments would cause an error.

## 1.17.0

### Minor Changes

- Support UUID v7 column ([#73](https://github.com/koyopro/accella/pull/73))

### Patch Changes

- Improvement of the generated types file ([#72](https://github.com/koyopro/accella/pull/72))

## 1.16.0

### Minor Changes

- Added getDatabaseConfig() to simplify initialization ([#71](https://github.com/koyopro/accella/pull/71))

### Patch Changes

- Set useNullAsDefault to true as default ([#70](https://github.com/koyopro/accella/pull/70))
- Fix the issue where the default value is not set for the uuid column ([#69](https://github.com/koyopro/accella/pull/69))

## 1.15.1 (2024-11-07)

### Patch Changes

- improve type of Search ([#62](https://github.com/koyopro/accella/pull/62))

## [1.15.0](https://github.com/koyopro/accella/compare/1.14.1...1.15.0) (2024-09-09)

### Features

- Form Objects ([#45](https://github.com/koyopro/accella/pull/45))

## [1.14.1](https://github.com/koyopro/accella/compare/1.14.0...1.14.1) (2024-09-04)

### Bug Fixes

- append files of accel-record package ([#46](https://github.com/koyopro/accella/pull/46))

## [1.14.0](https://github.com/koyopro/accella/compare/1.13.0...1.14.0) (2024-08-31)

### Features

- Support for Composite IDs ([#43](https://github.com/koyopro/accella/pull/43))
- add NumericalityValidator ([#44](https://github.com/koyopro/accella/pull/44))

## [1.13.0](https://github.com/koyopro/accella/compare/1.12.0...1.13.0) (2024-08-24)

### Features

- Translation of Enums ([#38](https://github.com/koyopro/accella/pull/38))

### Improvements

- Improve casting of Invalid Number and Date ([#39](https://github.com/koyopro/accella/pull/39))
- Modify the argument type of the find() method. ([#40](https://github.com/koyopro/accella/pull/40))
- Reduce unnecessary query execution when including hasMany association. ([#41](https://github.com/koyopro/accella/pull/41))

## [1.12.0](https://github.com/koyopro/accella/compare/1.11.0...1.12.0) (2024-08-17)

### Features

- Lock ([#35](https://github.com/koyopro/accella/pull/35))

### Improvements

- Improvement of the Search class interface ([#36](https://github.com/koyopro/accella/pull/36))
- Fix export path of accel-record/errors ([#37](https://github.com/koyopro/accella/pull/37))

## [1.11.0](https://github.com/koyopro/accella/compare/1.10.1...1.11.0) (2024-08-10)

### Features

- Flexible Search ([#33](https://github.com/koyopro/accella/pull/33))

### Improvements

- Nested join and nested association search ([#32](https://github.com/koyopro/accella/pull/32))

## [1.10.1](https://github.com/koyopro/accella/compare/1.10.0...1.10.1) (2024-08-02)

### Improvements

- change sync-rpc/index.cjs to esm ([#29](https://github.com/koyopro/accella/pull/29))
- Make passwordDigest optional when calling create() ([#30](https://github.com/koyopro/accella/pull/30))
- Throw a RecordNotFound error when the id passed to find() is not finite. ([#31](https://github.com/koyopro/accella/pull/31))

## [1.10.0](https://github.com/koyopro/accella/compare/1.9.1...1.10.0) (2024-07-20)

### Features

- Scopes ([#24](https://github.com/koyopro/accella/pull/24))

### Improvements

- Improvement of hasSecurePassword validation ([#23](https://github.com/koyopro/accella/pull/23))
- add validate option to save() ([#25](https://github.com/koyopro/accella/pull/25))
- Allow any key in the assignAttributes function's arguments. ([#26](https://github.com/koyopro/accella/pull/26))
- add message getter to Error ([#27](https://github.com/koyopro/accella/pull/27))

## [1.9.1](https://github.com/koyopro/accella/compare/1.9.0...1.9.1) (2024-07-12)

### Bug Fixes

- add bcrypt-ts to dependencies ([#22](https://github.com/koyopro/accella/pull/22))

## [1.9.0](https://github.com/koyopro/accella/compare/1.8.0...1.9.0) (2024-07-12)

### Features

- Password Authentication ([#19](https://github.com/koyopro/accella/pull/19))
- Add methods to Relation (or, queryBuilder) ([#20](https://github.com/koyopro/accella/pull/20))

### Bug Fixes

- Improvements related to associations ([#21](https://github.com/koyopro/accella/pull/21))

## [1.8.0](https://github.com/koyopro/accella/compare/1.7.0...1.8.0) (2024-07-02)

### Features

- PostgreSQL Support ([#18](https://github.com/koyopro/accella/pull/18))

### Bug Fixes

- Modify the type of Relation's methods for Collection. ([#17](https://github.com/koyopro/accella/pull/17))

## [1.7.0](https://github.com/koyopro/accella/compare/1.6.0...1.7.0) (2024-06-25)

### Features

- Callbacks ([#16](https://github.com/koyopro/accella/pull/16))

## [1.6.0](https://github.com/koyopro/accella/compare/1.5.0...1.6.0) (2024-06-18)

### Features

- Internationalization (I18n) ([#13](https://github.com/koyopro/accella/pull/13))
- Transaction improvement (returning the result of the callback, supporting asynchronous callbacks) ([#12](https://github.com/koyopro/accella/pull/12))

## [1.5.0](https://github.com/koyopro/accella/compare/1.4.0...1.5.0) (2024-06-10)

### Features

- Nested transaction ([#8](https://github.com/koyopro/accella/pull/8), [#11](https://github.com/koyopro/accella/pull/11))
- Adding query interface (first, last, pluck, findEach, updateAll) ([#9](https://github.com/koyopro/accella/pull/9))

## [1.4.0](https://github.com/koyopro/accella/compare/1.3.0...1.4.0) (2024-06-03)

### Features

- Serialization ([#7](https://github.com/koyopro/accella/pull/7))
- Make it possible to pass associations to the 'where' condition. ([#6](https://github.com/koyopro/accella/pull/6))

## [1.3.0](https://github.com/koyopro/accella/compare/1.2.0...1.3.0) (2024-05-27)

### Features

- Bulk Insert ([#5](https://github.com/koyopro/accella/pull/5))

### Bug Fixes

- fixed the issue when calling initAccelRecord multiple times ([#4](https://github.com/koyopro/accella/pull/4))

## [1.2.0](https://github.com/koyopro/accella/compare/1.1.0...1.2.0) (2024-05-15)

### Features

- Model Factory ([#3](https://github.com/koyopro/accella/pull/3))

## [1.1.0](https://github.com/koyopro/accella/compare/1.0.0...1.1.0) (2024-04-25)

### Features

- Validation ([#2](https://github.com/koyopro/accella/pull/2))
