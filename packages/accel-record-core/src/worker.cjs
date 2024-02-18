const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function init(connection) {
  return function (query) {
    const { type, sql, bindings } = query;
    if (type == "query") {
      return prisma.$queryRawUnsafe(sql, ...bindings);
    } else {
      return prisma.$executeRawUnsafe(sql, ...bindings);
    }
  };
}
module.exports = init;
