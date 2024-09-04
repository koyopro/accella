# [1.14.1](https://github.com/koyopro/accella/compare/1.14.0...1.14.1) (2024-09-04)

### Bug Fixes

- append files of accel-record package ([#46](https://github.com/koyopro/accella/pull/46))

# [1.14.0](https://github.com/koyopro/accella/compare/1.13.0...1.14.0) (2024-08-31)

### Features

- Support for Composite IDs ([#43](https://github.com/koyopro/accella/pull/43))
- add NumericalityValidator ([#44](https://github.com/koyopro/accella/pull/44))

# [1.13.0](https://github.com/koyopro/accella/compare/1.12.0...1.13.0) (2024-08-24)

### Features

- Translation of Enums ([#38](https://github.com/koyopro/accella/pull/38))

### Improvements

- Improve casting of Invalid Number and Date ([#39](https://github.com/koyopro/accella/pull/39))
- Modify the argument type of the find() method. ([#40](https://github.com/koyopro/accella/pull/40))
- Reduce unnecessary query execution when including hasMany association. ([#41](https://github.com/koyopro/accella/pull/41))

# [1.12.0](https://github.com/koyopro/accella/compare/1.11.0...1.12.0) (2024-08-17)

### Features

- Lock ([#35](https://github.com/koyopro/accella/pull/35))

### Improvements

- Improvement of the Search class interface ([#36](https://github.com/koyopro/accella/pull/36))
- Fix export path of accel-record/errors ([#37](https://github.com/koyopro/accella/pull/37))

# [1.11.0](https://github.com/koyopro/accella/compare/1.10.1...1.11.0) (2024-08-10)

### Features

- Flexible Search ([#33](https://github.com/koyopro/accella/pull/33))

### Improvements

- Nested join and nested association search ([#32](https://github.com/koyopro/accella/pull/32))

# [1.10.1](https://github.com/koyopro/accella/compare/1.10.0...1.10.1) (2024-08-02)

### Improvements

- change sync-rpc/index.cjs to esm ([#29](https://github.com/koyopro/accella/pull/29))
- Make passwordDigest optional when calling create() ([#30](https://github.com/koyopro/accella/pull/30))
- Throw a RecordNotFound error when the id passed to find() is not finite. ([#31](https://github.com/koyopro/accella/pull/31))

# [1.10.0](https://github.com/koyopro/accella/compare/1.9.1...1.10.0) (2024-07-20)

### Features

- Scopes ([#24](https://github.com/koyopro/accella/pull/24))

### Improvements

- Improvement of hasSecurePassword validation ([#23](https://github.com/koyopro/accella/pull/23))
- add validate option to save() ([#25](https://github.com/koyopro/accella/pull/25))
- Allow any key in the assignAttributes function's arguments. ([#26](https://github.com/koyopro/accella/pull/26))
- add message getter to Error ([#27](https://github.com/koyopro/accella/pull/27))

# [1.9.1](https://github.com/koyopro/accella/compare/1.9.0...1.9.1) (2024-07-12)

### Bug Fixes

- add bcrypt-ts to dependencies ([#22](https://github.com/koyopro/accella/pull/22))

# [1.9.0](https://github.com/koyopro/accella/compare/1.8.0...1.9.0) (2024-07-12)

### Features

- Password Authentication ([#19](https://github.com/koyopro/accella/pull/19))
- Add methods to Relation (or, queryBuilder) ([#20](https://github.com/koyopro/accella/pull/20))

### Bug Fixes

- Improvements related to associations ([#21](https://github.com/koyopro/accella/pull/21))

# [1.8.0](https://github.com/koyopro/accella/compare/1.7.0...1.8.0) (2024-07-02)

### Features

- PostgreSQL Support ([#18](https://github.com/koyopro/accella/pull/18))

### Bug Fixes

- Modify the type of Relation's methods for Collection. ([#17](https://github.com/koyopro/accella/pull/17))

# [1.7.0](https://github.com/koyopro/accella/compare/1.6.0...1.7.0) (2024-06-25)

### Features

- Callbacks ([#16](https://github.com/koyopro/accella/pull/16))

# [1.6.0](https://github.com/koyopro/accella/compare/1.5.0...1.6.0) (2024-06-18)

### Features

- Internationalization (I18n) ([#13](https://github.com/koyopro/accella/pull/13))
- Transaction improvement (returning the result of the callback, supporting asynchronous callbacks) ([#12](https://github.com/koyopro/accella/pull/12))

# [1.5.0](https://github.com/koyopro/accella/compare/1.4.0...1.5.0) (2024-06-10)

### Features

- Nested transaction ([#8](https://github.com/koyopro/accella/pull/8), [#11](https://github.com/koyopro/accella/pull/11))
- Adding query interface (first, last, pluck, findEach, updateAll) ([#9](https://github.com/koyopro/accella/pull/9))

# [1.4.0](https://github.com/koyopro/accella/compare/1.3.0...1.4.0) (2024-06-03)

### Features

- Serialization ([#7](https://github.com/koyopro/accella/pull/7))
- Make it possible to pass associations to the 'where' condition. ([#6](https://github.com/koyopro/accella/pull/6))

# [1.3.0](https://github.com/koyopro/accella/compare/1.2.0...1.3.0) (2024-05-27)

### Features

- Bulk Insert ([#5](https://github.com/koyopro/accella/pull/5))

### Bug Fixes

- fixed the issue when calling initAccelRecord multiple times ([#4](https://github.com/koyopro/accella/pull/4))

# [1.2.0](https://github.com/koyopro/accella/compare/1.1.0...1.2.0) (2024-05-15)

### Features

- Model Factory ([#3](https://github.com/koyopro/accella/pull/3))

# [1.1.0](https://github.com/koyopro/accella/compare/1.0.0...1.1.0) (2024-04-25)

### Features

- Validation ([#2](https://github.com/koyopro/accella/pull/2))
