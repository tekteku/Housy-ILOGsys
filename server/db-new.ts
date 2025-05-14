// filepath: c:\Users\TaherCh\Downloads\HousyTunisia\HousyTunisia\server\db.ts
import * as schema from "@shared/schema";
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

// Create a PostgreSQL pool for direct connection
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'development' ? false : { rejectUnauthorized: false }
});

// Create the Drizzle ORM instance
const db = drizzle(pgPool, { schema });

console.log(`Using PostgreSQL connection in ${process.env.NODE_ENV} mode`);

export { pgPool as pool, db };
