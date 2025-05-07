import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users related schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
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
  "other",
]);

// Pet status enum
export const petStatusEnum = pgEnum("pet_status", [
  "available",
  "adopted",
  "pending",
  "fostered",
]);

// Pets related schema
export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  species: text("species").notNull(), // dog, cat, rabbit, bird, other
  breed: text("breed").notNull(),
  age: integer("age").notNull(), // age in months
  gender: text("gender").notNull(), // male, female
  size: text("size").notNull(), // small, medium, large
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  status: text("status").notNull().default("available"), // available, adopted, pending, fostered
  location: text("location").notNull(),
  healthDetails: text("health_details").notNull(),
  goodWith: jsonb("good_with").notNull().default({}), // { kids: true, dogs: true, cats: false }
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPetSchema = createInsertSchema(pets).pick({
  name: true,
  species: true,
  breed: true,
  age: true,
  gender: true,
  size: true,
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
  petId: integer("pet_id"),
  type: text("type").notNull(), // meet_and_greet, veterinary_care, grooming
  date: timestamp("date").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  userId: true,
  petId: true,
  type: true,
  date: true,
  notes: true,
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

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
