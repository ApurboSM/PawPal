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
    
    // Appointments: where the visit happens (dropdown selections + pinned point)
    await db.execute(sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location_country TEXT;`);
    await db.execute(sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location_country_code TEXT;`);
    await db.execute(sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location_state TEXT;`);
    await db.execute(sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location_state_code TEXT;`);
    await db.execute(sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location_city TEXT;`);
    await db.execute(sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location_address TEXT;`);
    await db.execute(sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location_lat TEXT;`);
    await db.execute(sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location_lng TEXT;`);

    // Payments: customer-reported transfers into the shop's own wallet/bank
    // accounts, pending manual verification by an admin.
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        method TEXT NOT NULL,
        purpose TEXT NOT NULL,
        pet_id INTEGER,
        appointment_id INTEGER,
        amount TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'BDT',
        receiver_account TEXT,
        sender_name TEXT NOT NULL,
        sender_account TEXT NOT NULL,
        transaction_id TEXT NOT NULL,
        bank_name TEXT,
        branch_name TEXT,
        paid_at TIMESTAMP NOT NULL,
        note TEXT,
        proof_url TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        admin_note TEXT,
        reviewed_by INTEGER,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    // One transaction ID can only be claimed once per method.
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS payments_method_transaction_id_key
      ON payments (method, LOWER(transaction_id));
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments (user_id);`);

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate(); 