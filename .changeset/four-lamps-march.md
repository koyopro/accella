---
"accel-record-core": patch
"accel-record": patch
---

Changed to use `sourceFilePath` for calculating `datasourceUrl`. This fix resolves an issue where enabling `prismaSchemaFolder` and specifying a relative path for the SQLite datasource URL would cause a mismatch between the generated database file and the reference path.
