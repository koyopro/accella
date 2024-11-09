import { sequence } from "astro:middleware";
import { setupDatabase } from "../config/database";

await setupDatabase();

export const onRequest = sequence();
