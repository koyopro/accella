#!/usr/bin/env node

import { cli } from "./cli.js";

cli().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
