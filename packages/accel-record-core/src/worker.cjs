const { PrismaClient } = require("@prisma/client");

const DEBUG = false;

const output = (...args) => {
  if (DEBUG) console.log(...args);
};

const logger = {
  debug: output,
  info: output,
  error: output,
};

function init(connection) {
  const prisma = new PrismaClient(connection.prismaClientConfig ?? {});
  return function (query) {
    const { type, sql, bindings } = query;
    if (type == "query") {
      logger.info(`  \x1b[36mSQL  \x1b[34m${sql}\x1b[39m`, bindings);
      return prisma.$queryRawUnsafe(sql, ...bindings);
    } else {
      const color = /begin|commit|rollback/i.test(sql)
        ? "\x1b[36m"
        : "\x1b[32m";
      logger.info(`  \x1b[36mSQL  ${color}${sql}\x1b[39m`, bindings);
      return prisma.$executeRawUnsafe(sql, ...bindings);
    }
  };
}
module.exports = init;
