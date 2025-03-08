// Since package names starting with . cannot be loaded in ESM, use CommonJS format

// eslint-disable-next-line
const schema = require(".accel-record");

module.exports.schemaDir = schema.schemaDir;
module.exports.sourceFilePath = schema.sourceFilePath;
module.exports.dataSource = schema.dataSource;
