import "./env";
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

    // Pets: listing type (adopt/sell)
    await db.execute(sql`ALTER TABLE pets ADD COLUMN IF NOT EXISTS listing_type TEXT;`);
    await db.execute(sql`UPDATE pets SET listing_type = 'adopt' WHERE listing_type IS NULL;`);
    await db.execute(sql`ALTER TABLE pets ALTER COLUMN listing_type SET DEFAULT 'adopt';`);
    await db.execute(sql`ALTER TABLE pets ALTER COLUMN listing_type SET NOT NULL;`);
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate(); 