import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@pawpal/shared/schema";

neonConfig.webSocketConstructor = ws;

export const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

export const pool = hasDatabaseUrl
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : undefined;

export const db = hasDatabaseUrl
  ? drizzle({ client: pool!, schema })
  : undefined;