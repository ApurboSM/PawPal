import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertPetSchema, insertResourceSchema, insertAppointmentSchema, insertAdoptionApplicationSchema, insertTestimonialSchema, insertEmergencyContactSchema, insertPetMedicalRecordSchema } from "@pawpal/shared/schema";
import { z } from "zod";
import multer from "multer";
import type { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import { z as zod } from "zod";
import { hasDatabaseUrl, pool } from "./db";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user is an admin
const isAdmin = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
};

export function registerRoutes(app: Express): Server {
  // Set up authentication routes
  setupAuth(app);

  // Register new auth and user routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);

  // ---------- Health ----------
  const healthHandler = async (_req: Request, res: Response) => {
    const isDbConfigured = hasDatabaseUrl && Boolean(pool);
    let dbOk = false;

    if (isDbConfigured) {
      try {
        await pool!.query("select 1 as ok");
        dbOk = true;
      } catch {
        dbOk = false;
      }
    }

    res.json({
      ok: true,
      storage: isDbConfigured ? "database" : "memory",
      db: {
        configured: isDbConfigured,
        ok: dbOk,
      },
    });
  };

  // Backwards/shortcut health route
  app.get("/health", healthHandler);
  app.get("/api/health", healthHandler);

  // Root route (helpful during dev when people open the API port in the browser)
  app.get("/", (_req: Request, res: Response) => {
    return res.status(200).json({
      ok: true,
      service: "pawpal-api",
      env: process.env.NODE_ENV ?? "development",
      endpoints: {
        health: "/health",
        apiHealth: "/api/health",
      },
    });
  });

  // ---------- Current user profile ----------
  app.patch("/api/user", isAuthenticated, async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1).optional(),
        phone: z.string().optional().nullable(),
        location: z.string().optional().nullable(),
        profileImage: z.string().url().optional().nullable(),
      });

      const parsed = schema.parse(req.body);
      const updated = await storage.updateUser(req.user!.id, {
        ...parsed,
      } as any);
      if (!updated) return res.status(404).json({ message: "User not found" });

      const { password, ...userWithoutPassword } = updated as any;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update profile" });
      }
    }
  });

  // ---------- Pet Routes ----------

  // ---------- Uploads ----------
  // Store files in apps/api/uploads and serve them via /uploads (see src/index.ts).
  const uploadDir = path.resolve(process.cwd(), "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });

  const upload = multer({
    storage: multer.diskStorage({
      destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) =>
        cb(null, uploadDir),
      filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const safeExt = path.extname(file.originalname || "").slice(0, 10) || ".png";
        const name = `pet_${Date.now()}_${Math.random().toString(16).slice(2)}${safeExt}`;
        cb(null, name);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      if (file.mimetype?.startsWith("image/")) return cb(null, true);
      cb(new Error("Only image uploads are allowed"));
    },
  });

  app.post("/api/uploads/pet-image", isAuthenticated, upload.single("file"), async (req, res) => {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ message: "No file uploaded" });
    return res.json({ url: `/uploads/${file.filename}` });
  });
  
  // Get all pets with optional filters
  app.get("/api/pets", async (req, res) => {
    try {
      const { species, status, search, age, gender, size, goodWith, ownerId } = req.query;
      const filters: any = {};

      if (species) filters.species = String(species);
      if (status) filters.status = String(status);
      if (age) filters.age = Number(age);
      if (gender) filters.gender = String(gender);
      if (size) filters.size = String(size);
      if (ownerId !== undefined) filters.ownerId = Number(ownerId);

      let pets = await storage.getPets(Object.keys(filters).length ? filters : undefined);

      // Extra filtering (safe for both DB + in-memory)
      if (search) {
        const q = String(search).toLowerCase();
        pets = pets.filter((p) =>
          [p.name, p.breed, p.species, p.description].some((v) =>
            String(v ?? "").toLowerCase().includes(q),
          ),
        );
      }

      const goodWithList = Array.isArray(goodWith) ? goodWith : goodWith ? [goodWith] : [];
      if (goodWithList.length) {
        pets = pets.filter((p) =>
          goodWithList.every((k) => {
            const key = String(k);
            return Boolean((p.goodWith as any)?.[key]);
          }),
        );
      }

      res.json(pets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pets" });
    }
  });

  // Get current user's pet listings
  app.get("/api/me/pets", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const pets = await storage.getPets({ ownerId: userId } as any);
      res.json(pets);
    } catch {
      res.status(500).json({ message: "Failed to fetch your pets" });
    }
  });

  // Favorites (authenticated users)
  app.get("/api/pets/favorites", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      const favorites = user?.favorites ?? [];
      const pets = await storage.getPets();
      res.json(pets.filter((p) => favorites.includes(p.id)));
    } catch {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/pets/:id/favorite", isAuthenticated, async (req, res) => {
    try {
      const petId = Number(req.params.id);
      const user = await storage.getUser(req.user!.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const body = zod.object({ favorited: zod.boolean().optional() }).safeParse(req.body);
      const favorites = Array.isArray(user.favorites) ? [...user.favorites] : [];

      const shouldFavorite = body.success ? body.data.favorited : undefined;
      const isFav = favorites.includes(petId);

      let nextFavs = favorites;
      if (shouldFavorite === true && !isFav) nextFavs = [...favorites, petId];
      else if (shouldFavorite === false && isFav) nextFavs = favorites.filter((id) => id !== petId);
      else if (shouldFavorite === undefined) nextFavs = isFav ? favorites.filter((id) => id !== petId) : [...favorites, petId];

      const updated = await storage.updateUser(req.user!.id, { favorites: nextFavs });
      res.json({ favorites: updated?.favorites ?? nextFavs });
    } catch {
      res.status(500).json({ message: "Failed to update favorites" });
    }
  });
  
  // Get a specific pet by ID
  app.get("/api/pets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pet = await storage.getPet(id);
      
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      res.json(pet);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pet" });
    }
  });
  
  // Create a new pet (admin only)
  app.post("/api/pets", isAdmin, async (req, res) => {
    try {
      const petData = insertPetSchema.parse(req.body);
      const pet = await storage.createPet(petData);
      res.status(201).json(pet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid pet data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create pet" });
      }
    }
  });

  // Create a new pet listing (authenticated user)
  // Supports optional medical records array; records are stored in pet_medical_records.
  app.post("/api/pets/listings", isAuthenticated, async (req, res) => {
    try {
      const schema = insertPetSchema.omit({ ownerId: true }).extend({
        medicalRecords: z
          .array(
            insertPetMedicalRecordSchema
              .omit({ userId: true, petId: true })
              .extend({ recordDate: z.coerce.date() })
              .partial({ vetName: true, attachmentUrl: true, notes: true }),
          )
          .optional(),
      });

      const parsed = schema.parse(req.body);
      const { medicalRecords, ...petBody } = parsed as any;

      const pet = await storage.createPet({
        ...petBody,
        ownerId: req.user!.id,
      });

      if (medicalRecords?.length) {
        for (const record of medicalRecords) {
          await storage.createPetMedicalRecord({
            ...record,
            userId: req.user!.id,
            petId: pet.id,
          });
        }
      }

      res.status(201).json(pet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid pet listing data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create pet listing" });
      }
    }
  });
  
  // Update a pet (admin OR owner)
  app.put("/api/pets/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const petData = req.body;
      
      const existing = await storage.getPet(id);
      if (!existing) {
        return res.status(404).json({ message: "Pet not found" });
      }

      const isOwner = (existing as any).ownerId && (existing as any).ownerId === req.user!.id;
      const isAdminUser = req.user!.role === "admin";
      if (!isAdminUser && !isOwner) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedPet = await storage.updatePet(id, petData);
      
      if (!updatedPet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      res.json(updatedPet);
    } catch (error) {
      res.status(500).json({ message: "Failed to update pet" });
    }
  });
  
  // Delete a pet (admin OR owner)
  app.delete("/api/pets/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getPet(id);
      if (!existing) {
        return res.status(404).json({ message: "Pet not found" });
      }

      const isOwner = (existing as any).ownerId && (existing as any).ownerId === req.user!.id;
      const isAdminUser = req.user!.role === "admin";
      if (!isAdminUser && !isOwner) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const result = await storage.deletePet(id);
      
      if (!result) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete pet" });
    }
  });
  
  // ---------- Resource Routes ----------
  
  // Get all resources
  app.get("/api/resources", async (req, res) => {
    try {
      const resources = await storage.getResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  // Featured resources (for homepage)
  app.get("/api/resources/featured", async (_req, res) => {
    try {
      const resources = await storage.getResources();
      res.json(resources.slice(0, 3));
    } catch {
      res.status(500).json({ message: "Failed to fetch featured resources" });
    }
  });
  
  // Get a specific resource by ID
  app.get("/api/resources/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const resource = await storage.getResource(id);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resource" });
    }
  });
  
  // Create a new resource (admin only)
  app.post("/api/resources", isAdmin, async (req, res) => {
    try {
      const resourceData = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(resourceData);
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid resource data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create resource" });
      }
    }
  });
  
  // Update a resource (admin only)
  app.put("/api/resources/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const resourceData = req.body;
      
      const updatedResource = await storage.updateResource(id, resourceData);
      
      if (!updatedResource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      res.json(updatedResource);
    } catch (error) {
      res.status(500).json({ message: "Failed to update resource" });
    }
  });
  
  // Delete a resource (admin only)
  app.delete("/api/resources/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteResource(id);
      
      if (!result) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete resource" });
    }
  });
  
  // ---------- Appointment Routes ----------
  
  // Get all appointments for a user
  app.get("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const appointments = await storage.getAppointmentsForUser(userId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });
  
  // Get all appointments (admin only)
  app.get("/api/admin/appointments", isAdmin, async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });
  
  // Get a specific appointment
  app.get("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Users can only view their own appointments unless they're admins
      if (appointment.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });
  
  // Create a new appointment
  app.post("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const body = z
        .object({
          petId: z.number().nullable().optional(),
          type: z.string(),
          date: z.coerce.date(),
          notes: z.string().optional(),
          participantUserId: z.number().nullable().optional(),
        })
        .parse(req.body);

      let participantUserId = body.participantUserId ?? null;
      const petId = body.petId ?? null;

      // If this is a pet meetup appointment, auto-link the pet owner as the second participant.
      if (!participantUserId && petId) {
        const pet = await storage.getPet(petId);
        participantUserId = (pet as any)?.ownerId ?? null;
      }

      const appointmentData = insertAppointmentSchema.parse({
        userId: req.user!.id,
        participantUserId,
        petId,
        type: body.type,
        date: body.date,
        notes: body.notes,
      });
      
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create appointment" });
      }
    }
  });
  
  // Update an appointment
  app.put("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Users can only update their own appointments unless they're admins
      if (appointment.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedAppointment = await storage.updateAppointment(id, req.body);
      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });
  
  // Delete an appointment
  app.delete("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Users can only delete their own appointments unless they're admins
      if (appointment.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const result = await storage.deleteAppointment(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });
  
  // ---------- Adoption Application Routes ----------
  
  // Get all adoption applications for a user
  app.get("/api/adoption-applications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const applications = await storage.getAdoptionApplicationsByUser(userId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch adoption applications" });
    }
  });
  
  // Get all adoption applications for a pet (admin only)
  app.get("/api/pets/:id/adoption-applications", isAdmin, async (req, res) => {
    try {
      const petId = parseInt(req.params.id);
      const applications = await storage.getAdoptionApplicationsByPet(petId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch adoption applications" });
    }
  });
  
  // Create a new adoption application
  app.post("/api/adoption-applications", isAuthenticated, async (req, res) => {
    try {
      const applicationData = insertAdoptionApplicationSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      const application = await storage.createAdoptionApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid application data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create adoption application" });
      }
    }
  });
  
  // Update an adoption application status (admin only)
  app.put("/api/adoption-applications/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedApplication = await storage.updateAdoptionApplication(id, { status });
      
      if (!updatedApplication) {
        return res.status(404).json({ message: "Adoption application not found" });
      }
      
      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Failed to update adoption application" });
    }
  });
  
  // ---------- Testimonial Routes ----------
  
  // Get all testimonials
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });
  
  // Create a new testimonial (authenticated users only)
  app.post("/api/testimonials", isAuthenticated, async (req, res) => {
    try {
      const testimonialData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(testimonialData);
      res.status(201).json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid testimonial data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create testimonial" });
      }
    }
  });
  
  // Delete a testimonial (admin only)
  app.delete("/api/testimonials/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteTestimonial(id);
      
      if (!result) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete testimonial" });
    }
  });
  
  // ---------- Emergency Contact Routes ----------
  
  // Get all emergency contacts for a user
  app.get("/api/emergency-contacts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const contacts = await storage.getEmergencyContactsByUser(userId);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emergency contacts" });
    }
  });
  
  // Get a specific emergency contact
  app.get("/api/emergency-contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.getEmergencyContact(id);
      
      if (!contact) {
        return res.status(404).json({ message: "Emergency contact not found" });
      }
      
      // Users can only view their own emergency contacts unless they're admins
      if (contact.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emergency contact" });
    }
  });
  
  // Create a new emergency contact
  app.post("/api/emergency-contacts", isAuthenticated, async (req, res) => {
    try {
      const contactData = insertEmergencyContactSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      const contact = await storage.createEmergencyContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid emergency contact data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create emergency contact" });
      }
    }
  });
  
  // Update an emergency contact
  app.put("/api/emergency-contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.getEmergencyContact(id);
      
      if (!contact) {
        return res.status(404).json({ message: "Emergency contact not found" });
      }
      
      // Users can only update their own emergency contacts unless they're admins
      if (contact.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedContact = await storage.updateEmergencyContact(id, req.body);
      res.json(updatedContact);
    } catch (error) {
      res.status(500).json({ message: "Failed to update emergency contact" });
    }
  });
  
  // Delete an emergency contact
  app.delete("/api/emergency-contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.getEmergencyContact(id);
      
      if (!contact) {
        return res.status(404).json({ message: "Emergency contact not found" });
      }
      
      // Users can only delete their own emergency contacts unless they're admins
      if (contact.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const result = await storage.deleteEmergencyContact(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete emergency contact" });
    }
  });
  
  // ---------- Pet Medical Record Routes ----------
  // ---------- Newsletter ----------
  app.post("/api/newsletter", async (req, res) => {
    const schema = z.object({
      email: z.string().email(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Placeholder: store in DB later (newsletter_subscriptions table).
    // For now return success so newsletter CTA works end-to-end.
    return res.status(200).json({ ok: true });
  });
  
  // Get all medical records for a user's pets
  app.get("/api/pet-medical-records", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const records = await storage.getPetMedicalRecordsByUser(userId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pet medical records" });
    }
  });
  
  // Get all medical records for a specific pet
  app.get("/api/pets/:petId/medical-records", async (req, res) => {
    try {
      const petId = parseInt(req.params.petId);
      const pet = await storage.getPet(petId);
      
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      const records = await storage.getPetMedicalRecordsByPet(petId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pet medical records" });
    }
  });
  
  // Get a specific medical record
  app.get("/api/pet-medical-records/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const record = await storage.getPetMedicalRecord(id);
      
      if (!record) {
        return res.status(404).json({ message: "Medical record not found" });
      }
      
      // Users can only view their own pets' medical records unless they're admins
      if (record.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medical record" });
    }
  });
  
  // Create a new medical record
  app.post("/api/pet-medical-records", isAuthenticated, async (req, res) => {
    try {
      const recordData = z
        .object({
          petId: z.number(),
          recordType: z.string(),
          recordDate: z.coerce.date(),
          description: z.string(),
          vetName: z.string().nullable().optional(),
          attachmentUrl: z.string().nullable().optional(),
          notes: z.string().nullable().optional(),
        })
        .parse(req.body);
      
      const record = await storage.createPetMedicalRecord({
        ...recordData,
        userId: req.user!.id,
      } as any);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid medical record data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create medical record" });
      }
    }
  });
  
  // Update a medical record
  app.put("/api/pet-medical-records/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const record = await storage.getPetMedicalRecord(id);
      
      if (!record) {
        return res.status(404).json({ message: "Medical record not found" });
      }
      
      // Users can only update their own pets' medical records unless they're admins
      if (record.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedRecord = await storage.updatePetMedicalRecord(id, req.body);
      res.json(updatedRecord);
    } catch (error) {
      res.status(500).json({ message: "Failed to update medical record" });
    }
  });
  
  // Delete a medical record
  app.delete("/api/pet-medical-records/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const record = await storage.getPetMedicalRecord(id);
      
      if (!record) {
        return res.status(404).json({ message: "Medical record not found" });
      }
      
      // Users can only delete their own pets' medical records unless they're admins
      if (record.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const result = await storage.deletePetMedicalRecord(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete medical record" });
    }
  });

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const clients = new Map<WebSocket, { userId?: number; username?: string; isAdmin?: boolean }>();
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    clients.set(ws, {});
    
    // Handle messages from clients
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Handle authentication
        if (data.type === 'auth') {
          const { userId, username, isAdmin } = data;
          clients.set(ws, { userId, username, isAdmin });
          
          // Send confirmation back to the client
          ws.send(JSON.stringify({
            type: 'auth_success',
            data: { userId, username, isAdmin }
          }));
          
          return;
        }
        
        // Handle chat messages
        if (data.type === 'chat_message') {
          const clientInfo = clients.get(ws);
          
          // Create message object with sender info
          const messageToSend = {
            type: 'chat_message',
            data: {
              id: Date.now(), // Use timestamp as temporary ID
              message: data.message,
              sender: {
                userId: clientInfo?.userId || 'guest',
                username: clientInfo?.username || 'Guest',
                isAdmin: clientInfo?.isAdmin || false
              },
              timestamp: new Date().toISOString()
            }
          };
          
          // Broadcast to all clients or target a specific user
          if (data.recipientId) {
            // Find the recipient and send the private message
            for (const [client, info] of clients.entries()) {
              if (info.userId === data.recipientId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messageToSend));
                // Also send back to the sender
                ws.send(JSON.stringify(messageToSend));
                break;
              }
            }
          } else {
            // Broadcast to all connected clients
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messageToSend));
              }
            });
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Invalid message format' }
        }));
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      clients.delete(ws);
    });
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'system_message',
      data: {
        message: 'Welcome to PawPal chat! If you\'re logged in, send an auth message to identify yourself.',
        timestamp: new Date().toISOString()
      }
    }));
  });
  
  return httpServer;
}
