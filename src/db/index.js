import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

/**
 * Database connection singleton with connection pooling
 * Uses postgres.js driver optimized for serverless environments
 *
 * Note: prepare: false is required for Supabase Transaction pooler mode
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV !== "test") {
	throw new Error("DATABASE_URL environment variable is not set");
}

const client = connectionString
	? postgres(connectionString, {
			prepare: false,
			max: 10,
			idle_timeout: 20,
			connect_timeout: 10,
	  })
	: null;

export const db = client ? drizzle(client, { schema }) : null;

/**
 * @typedef {typeof db} DB
 */
