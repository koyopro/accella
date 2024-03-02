const { PrismaClient } = require("@prisma/client");

function init(connection) {
  const prisma = new PrismaClient(connection.prismaClientConfig ?? {});
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
