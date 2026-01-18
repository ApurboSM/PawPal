import "./env";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db, hasDatabaseUrl, pool } from "./db";
import {
  users,
  pets,
  resources,
  testimonials,
  emergencyContacts,
  petMedicalRecords,
  adoptionApplications,
  appointments,
} from "@pawpal/shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function ensureDbReady() {
  if (!hasDatabaseUrl || !db || !pool) {
    throw new Error("DATABASE_URL is not set. Create apps/api/.env and set DATABASE_URL before seeding.");
  }

  // Ensure new columns exist (schema migrations applied)
  const cols = await pool.query(
    "select column_name from information_schema.columns where table_schema='public' and table_name='pets'",
  );
  const hasOwnerId = cols.rows.some((r) => r.column_name === "owner_id");
  if (!hasOwnerId) {
    throw new Error("Schema not updated on DB. Run: npm run db:push (from repo root) and try again.");
  }

  const colsAppt = await pool.query(
    "select column_name from information_schema.columns where table_schema='public' and table_name='appointments'",
  );
  const hasParticipant = colsAppt.rows.some((r) => r.column_name === "participant_user_id");
  if (!hasParticipant) {
    throw new Error("Schema not updated on DB. Run: npm run db:push (from repo root) and try again.");
  }
}

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysFromNow(minDays: number, maxDays: number) {
  const delta = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const d = new Date();
  d.setDate(d.getDate() + delta);
  d.setHours(10 + Math.floor(Math.random() * 7), 0, 0, 0);
  return d;
}

async function main() {
  await ensureDbReady();

  // ---- USERS ----
  const existingUsers = await db!.select().from(users);
  const userByUsername = new Map(existingUsers.map((u) => [u.username, u]));

  const seedUsernames = ["owner1", "owner2", "owner3", "buyer1", "buyer2", "vethelper"];
  for (const username of seedUsernames) {
    if (userByUsername.has(username)) continue;
    const created = await db!
      .insert(users)
      .values({
        username,
        password: await hashPassword("password123"),
        email: `${username}@pawpal.dev`,
        name: username.toUpperCase(),
        role: "user",
        phone: "+1 555 0100",
        location: "City Center",
        favorites: [],
        adoptionHistory: [],
      })
      .returning();
    userByUsername.set(username, created[0]);
  }

  const seedUsers = Array.from(userByUsername.values());

  // ---- RESOURCES ----
  const existingResources = await db!.select().from(resources);
  if (existingResources.length < 8) {
    const toAdd = 8 - existingResources.length;
    const categories = ["New Pet Owners", "Nutrition", "Training", "Pet Health & Safety", "Emergency"];
    const base = [
      {
        title: "Hydration for Pets: What to Watch For",
        summary: "Learn the signs of dehydration and how to keep pets properly hydrated.",
        content: "Hydration is essential. Watch for dry gums, lethargy, and reduced skin elasticity...",
        category: "Pet Health & Safety",
        imageUrl: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8",
      },
      {
        title: "How to Introduce a New Pet to Your Home",
        summary: "A simple step-by-step intro plan for a calm first week.",
        content: "Start with a safe space, slow introductions, and consistent routines...",
        category: "New Pet Owners",
        imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
      },
      {
        title: "Emergency Checklist: What to Save on Your Phone",
        summary: "Key emergency contacts and info every pet owner should have ready.",
        content: "Save your vet, 24/7 emergency clinic, poison helpline, and your pet’s medical notes...",
        category: "Emergency",
        imageUrl: "https://images.unsplash.com/photo-1584466977773-e625c37cdd50",
      },
    ];

    const payload = Array.from({ length: toAdd }).map((_, i) => {
      const b = base[i % base.length];
      return {
        ...b,
        title: `${b.title} (${i + 1})`,
        category: pick(categories),
      };
    });

    await db!.insert(resources).values(payload);
  }

  // ---- TESTIMONIALS ----
  const existingTestimonials = await db!.select().from(testimonials);
  if (existingTestimonials.length < 10) {
    const toAdd = 10 - existingTestimonials.length;
    const petTypes = ["Dog", "Cat", "Rabbit", "Bird"];
    const payload = Array.from({ length: toAdd }).map((_, i) => ({
      name: `Happy Adopter ${existingTestimonials.length + i + 1}`,
      petName: pick(["Buddy", "Luna", "Max", "Coco", "Rio", "Nala"]),
      petType: pick(petTypes),
      content:
        "PawPal made the process smooth and easy. Our new companion has brought so much joy!",
      rating: 5,
      imageUrl: "https://randomuser.me/api/portraits/lego/1.jpg",
    }));
    await db!.insert(testimonials).values(payload);
  }

  // ---- PETS (20+) ----
  const existingPets = await db!.select().from(pets);
  const desiredPetCount = 25;
  if (existingPets.length < desiredPetCount) {
    const toAdd = desiredPetCount - existingPets.length;
    const species = ["dog", "cat", "rabbit", "bird", "hamster", "other"] as const;
    const breeds = ["Golden Retriever", "Siamese", "Beagle", "Holland Lop", "Parakeet", "Mixed"];
    const sizes = ["small", "medium", "large"];
    const genders = ["male", "female"];

    const owners = [
      userByUsername.get("owner1")!,
      userByUsername.get("owner2")!,
      userByUsername.get("owner3")!,
    ];

    const payload = Array.from({ length: toAdd }).map((_, i) => ({
      ownerId: pick(owners).id,
      name: `Pet ${existingPets.length + i + 1}`,
      species: pick([...species]),
      breed: pick(breeds),
      age: 6 + Math.floor(Math.random() * 84),
      gender: pick(genders),
      size: pick(sizes),
      description:
        "Friendly, healthy, and looking for a loving home. Great temperament and well socialized.",
      imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d",
      status: "available",
      location: pick(["2.1 miles away", "3.7 miles away", "5.0 miles away", "Downtown"]),
      healthDetails: "Vaccinated, dewormed, and vet-checked.",
      goodWith: { kids: true, dogs: true, cats: false },
    }));

    const inserted = await db!.insert(pets).values(payload).returning();

    // ---- MEDICAL RECORDS (1-3 per inserted pet) ----
    const recordTypes = ["vaccination", "check-up", "medication", "allergy"];
    const recordsPayload = inserted.flatMap((p) => {
      const count = 1 + Math.floor(Math.random() * 3);
      const ownerId = (p as any).ownerId ?? pick(seedUsers).id;
      return Array.from({ length: count }).map(() => ({
        userId: ownerId,
        petId: p.id,
        recordType: pick(recordTypes),
        recordDate: daysFromNow(-120, -5),
        description: "Routine record added during seeding.",
        vetName: "Dr. Paw",
        attachmentUrl: null,
        notes: null,
      }));
    });
    await db!.insert(petMedicalRecords).values(recordsPayload);

    // ---- ADOPTION APPLICATIONS ----
    const buyers = [userByUsername.get("buyer1")!, userByUsername.get("buyer2")!];
    const appsPayload = inserted.slice(0, Math.min(12, inserted.length)).map((p) => ({
      userId: pick(buyers).id,
      petId: p.id,
      notes: "I’d love to adopt. I have a safe home environment and prior experience with pets.",
    }));
    await db!.insert(adoptionApplications).values(appsPayload);

    // ---- APPOINTMENTS (two-user meetups) ----
    const apptsPayload = inserted.slice(0, Math.min(10, inserted.length)).map((p) => ({
      userId: pick(buyers).id,
      participantUserId: (p as any).ownerId ?? null,
      petId: p.id,
      type: "meet_and_greet",
      date: daysFromNow(2, 30),
      notes: "Meet & greet scheduled via PawPal.",
    }));
    await db!.insert(appointments).values(apptsPayload);
  }

  // ---- EMERGENCY CONTACTS ----
  const existingContacts = await db!.select().from(emergencyContacts);
  if (existingContacts.length < seedUsers.length) {
    const existingUserIds = new Set(existingContacts.map((c) => c.userId));
    const toCreate = seedUsers.filter((u) => !existingUserIds.has(u.id));

    await db!.insert(emergencyContacts).values(
      toCreate.map((u) => ({
        userId: u.id,
        contactName: "24/7 Emergency Vet",
        phone: "+1 555 0100",
        address: "123 Pet Street, City",
        isVet: true,
        email: "emergency-vet@pawpal.dev",
        notes: "Always call ahead if possible.",
      })),
    );
  }

  console.log("✅ Seed complete.");
}

main().catch((e) => {
  console.error("❌ Seed failed:", e?.message ?? e);
  process.exit(1);
});

