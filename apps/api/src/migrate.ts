import { db } from './db';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    if (!db) {
      throw new Error("DATABASE_URL must be set to run migrations");
    }

    // Add all missing columns to users table, one at a time for compatibility
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS favorites JSONB DEFAULT '[]';`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS adoption_history JSONB DEFAULT '[]';`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();`);
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate(); 