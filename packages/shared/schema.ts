import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const goodWithSchema = z
  .object({
    kids: z.boolean().optional(),
    dogs: z.boolean().optional(),
    cats: z.boolean().optional(),
  })
  .default({});

// Users related schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  profileImage: text("profile_image"),
  phone: text("phone"),
  location: text("location"),
  role: text("role").notNull().default("user"), // user, admin
  favorites: jsonb("favorites").$type<number[]>().notNull().default([]), // Array of pet IDs
  adoptionHistory: jsonb("adoption_history").$type<number[]>().notNull().default([]), // Array of pet IDs
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  profileImage: true,
  phone: true,
  location: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Pet species enum
export const petSpeciesEnum = pgEnum("pet_species", [
  "dog",
  "cat",
  "rabbit",
  "bird",
  "guinea_pig",
  "fish",
  "parrot", 
  "hamster",
  "other",
]);

// Pet status enum
export const petStatusEnum = pgEnum("pet_status", [
  "available",
  "adopted",
  "pending",
  "fostered",
]);

export const petListingTypeEnum = pgEnum("pet_listing_type", ["adopt", "sell"]);

// Pets related schema
export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  // Owner of the pet listing (seller/owner). Null for admin/seed listings.
  ownerId: integer("owner_id"),
  name: text("name").notNull(),
  species: text("species").notNull(), // dog, cat, rabbit, bird, guinea_pig, fish, parrot, hamster, other
  breed: text("breed").notNull(),
  age: integer("age").notNull(), // age in months
  gender: text("gender").notNull(), // male, female
  size: text("size").notNull(), // small, medium, large
  listingType: text("listing_type").notNull().default("adopt"), // adopt, sell
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  status: text("status").notNull().default("available"), // available, adopted, pending, fostered
  location: text("location").notNull(),
  healthDetails: text("health_details").notNull(),
  goodWith: jsonb("good_with")
    .$type<{ kids?: boolean; dogs?: boolean; cats?: boolean }>()
    .notNull()
    .default({}), // { kids: true, dogs: true, cats: false }
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPetSchema = createInsertSchema(pets, {
  goodWith: goodWithSchema,
}).pick({
  ownerId: true,
  name: true,
  species: true,
  breed: true,
  age: true,
  gender: true,
  size: true,
  listingType: true,
  description: true,
  imageUrl: true,
  status: true,
  location: true,
  healthDetails: true,
  goodWith: true,
});

export type InsertPet = z.infer<typeof insertPetSchema>;
export type Pet = typeof pets.$inferSelect;

// Adoption applications
export const adoptionApplications = pgTable("adoption_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  petId: integer("pet_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  applicationDate: timestamp("application_date").defaultNow(),
  notes: text("notes"),
});

export const insertAdoptionApplicationSchema = createInsertSchema(adoptionApplications).pick({
  userId: true,
  petId: true,
  notes: true,
});

export type InsertAdoptionApplication = z.infer<typeof insertAdoptionApplicationSchema>;
export type AdoptionApplication = typeof adoptionApplications.$inferSelect;

// Resources/articles
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  category: text("category").notNull(), // getting started, nutrition, training, etc.
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  title: true,
  content: true,
  summary: true,
  category: true,
  imageUrl: true,
});

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

// Appointments
export const appointmentTypes = pgEnum("appointment_types", [
  "meet_and_greet",
  "veterinary_care",
  "grooming",
]);

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  participantUserId: integer("participant_user_id"),
  petId: integer("pet_id"),
  type: text("type").notNull(), // meet_and_greet, veterinary_care, grooming
  date: timestamp("date").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
  // Where the appointment happens. Names are stored alongside the ISO codes so a
  // saved appointment still renders correctly if the geo dataset ever changes.
  locationCountry: text("location_country"),
  locationCountryCode: text("location_country_code"),
  locationState: text("location_state"),
  locationStateCode: text("location_state_code"),
  locationCity: text("location_city"),
  locationAddress: text("location_address"),
  // Stored as text: the exact decimal the user pinned round-trips unchanged, and
  // nothing here does arithmetic on the coordinates.
  locationLat: text("location_lat"),
  locationLng: text("location_lng"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointmentLocationSchema = z.object({
  locationCountry: z.string().min(1, "Select a country"),
  locationCountryCode: z.string().min(1),
  locationState: z.string().min(1, "Select a state or division"),
  locationStateCode: z.string().min(1),
  locationCity: z.string().min(1, "Select a city"),
  locationAddress: z.string().min(5, "Write your address"),
  locationLat: z.string().min(1, "Pin the exact spot on the map"),
  locationLng: z.string().min(1, "Pin the exact spot on the map"),
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  userId: true,
  participantUserId: true,
  petId: true,
  type: true,
  date: true,
  notes: true,
  locationCountry: true,
  locationCountryCode: true,
  locationState: true,
  locationStateCode: true,
  locationCity: true,
  locationAddress: true,
  locationLat: true,
  locationLng: true,
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Payments
//
// PawPal does not process card or wallet charges itself. The customer pays into
// one of the listed accounts from their own bKash/Rocket/Nagad/Upay/bank app and
// then reports the transaction here, so every row is a *claim* that an admin
// verifies against the receiving account statement.
export const paymentMethodValues = ["bkash", "rocket", "nagad", "upay", "bank"] as const;
export const paymentPurposeValues = [
  "pet_purchase",
  "adoption_fee",
  "appointment_fee",
  "donation",
  "other",
] as const;
export const paymentStatusValues = ["pending", "verified", "rejected"] as const;

export type PaymentMethod = (typeof paymentMethodValues)[number];
export type PaymentPurpose = (typeof paymentPurposeValues)[number];
export type PaymentStatus = (typeof paymentStatusValues)[number];

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  method: text("method").notNull(), // bkash, rocket, nagad, upay, bank
  purpose: text("purpose").notNull(), // pet_purchase, adoption_fee, ...
  petId: integer("pet_id"),
  appointmentId: integer("appointment_id"),
  // Kept as text for the same reason coordinates are: it is a reported figure,
  // not something the app does arithmetic on.
  amount: text("amount").notNull(),
  currency: text("currency").notNull().default("BDT"),
  // Which of our accounts the money was sent to, captured at submit time so a
  // later config change cannot rewrite history.
  receiverAccount: text("receiver_account"),
  senderName: text("sender_name").notNull(),
  senderAccount: text("sender_account").notNull(), // wallet number or bank account
  transactionId: text("transaction_id").notNull(), // TrxID / bank reference
  bankName: text("bank_name"),
  branchName: text("branch_name"),
  paidAt: timestamp("paid_at").notNull(),
  note: text("note"),
  proofUrl: text("proof_url"), // uploaded screenshot / deposit slip
  status: text("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  userId: true,
  method: true,
  purpose: true,
  petId: true,
  appointmentId: true,
  amount: true,
  currency: true,
  receiverAccount: true,
  senderName: true,
  senderAccount: true,
  transactionId: true,
  bankName: true,
  branchName: true,
  paidAt: true,
  note: true,
  proofUrl: true,
});

/** What the client posts to /api/payments. */
export const submitPaymentSchema = z
  .object({
    method: z.enum(paymentMethodValues),
    purpose: z.enum(paymentPurposeValues),
    petId: z.number().int().positive().nullable().optional(),
    appointmentId: z.number().int().positive().nullable().optional(),
    amount: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Enter the amount you sent, e.g. 1500 or 1500.50")
      .refine((value) => Number(value) > 0, "Amount must be more than 0"),
    currency: z.string().trim().default("BDT"),
    receiverAccount: z.string().trim().optional(),
    senderName: z.string().trim().min(2, "Enter the name on the sending account"),
    senderAccount: z
      .string()
      .trim()
      .min(6, "Enter the number or account you paid from"),
    transactionId: z
      .string()
      .trim()
      .min(4, "Enter the transaction ID from your payment confirmation"),
    bankName: z.string().trim().optional(),
    branchName: z.string().trim().optional(),
    paidAt: z.coerce.date(),
    note: z.string().trim().max(500).optional(),
    proofUrl: z.string().trim().optional(),
  })
  .refine((value) => value.method !== "bank" || Boolean(value.bankName), {
    message: "Bank name is required for bank transfers",
    path: ["bankName"],
  });

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type SubmitPayment = z.infer<typeof submitPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Testimonials
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  petName: text("pet_name").notNull(),
  petType: text("pet_type").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).pick({
  name: true,
  petName: true,
  petType: true,
  content: true,
  rating: true,
  imageUrl: true,
});

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// Emergency Contacts
export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contactName: text("contact_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  isVet: boolean("is_vet").notNull().default(false),
  email: text("email"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).pick({
  userId: true,
  contactName: true,
  phone: true,
  address: true,
  isVet: true,
  email: true,
  notes: true,
});

export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;

// Pet Medical History
export const petMedicalRecords = pgTable("pet_medical_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  petId: integer("pet_id").notNull(),
  recordType: text("record_type").notNull(), // vaccination, surgery, check-up, medication, allergy, etc.
  recordDate: timestamp("record_date").notNull(),
  description: text("description").notNull(),
  vetName: text("vet_name"),
  attachmentUrl: text("attachment_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPetMedicalRecordSchema = createInsertSchema(petMedicalRecords).pick({
  userId: true,
  petId: true,
  recordType: true,
  recordDate: true,
  description: true,
  vetName: true,
  attachmentUrl: true,
  notes: true,
});

export type InsertPetMedicalRecord = z.infer<typeof insertPetMedicalRecordSchema>;
export type PetMedicalRecord = typeof petMedicalRecords.$inferSelect;

// Contact form messages submitted from the public contact page
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  // Null when the sender is not logged in.
  userId: integer("user_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"), // new, read, archived
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages, {
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(40).optional().nullable(),
  subject: z.string().min(3).max(150),
  message: z.string().min(10).max(5000),
}).pick({
  userId: true,
  name: true,
  email: true,
  phone: true,
  subject: true,
  message: true,
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
