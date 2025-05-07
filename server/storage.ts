import { users, type User, type InsertUser, pets, type Pet, type InsertPet, resources, type Resource, type InsertResource, appointments, type Appointment, type InsertAppointment, adoptionApplications, type AdoptionApplication, type InsertAdoptionApplication, testimonials, type Testimonial, type InsertTestimonial } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Create memory store for sessions
const MemoryStore = createMemoryStore(session);

// Define the Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Pet operations
  getPet(id: number): Promise<Pet | undefined>;
  getPets(filters?: Partial<Pet>): Promise<Pet[]>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: number, pet: Partial<Pet>): Promise<Pet | undefined>;
  deletePet(id: number): Promise<boolean>;
  
  // Resource operations
  getResource(id: number): Promise<Resource | undefined>;
  getResources(): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<Resource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;
  
  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByUser(userId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  
  // Adoption application operations
  getAdoptionApplication(id: number): Promise<AdoptionApplication | undefined>;
  getAdoptionApplicationsByUser(userId: number): Promise<AdoptionApplication[]>;
  getAdoptionApplicationsByPet(petId: number): Promise<AdoptionApplication[]>;
  createAdoptionApplication(application: InsertAdoptionApplication): Promise<AdoptionApplication>;
  updateAdoptionApplication(id: number, application: Partial<AdoptionApplication>): Promise<AdoptionApplication | undefined>;
  
  // Testimonial operations
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  getTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, testimonial: Partial<Testimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pets: Map<number, Pet>;
  private resources: Map<number, Resource>;
  private appointments: Map<number, Appointment>;
  private adoptionApplications: Map<number, AdoptionApplication>;
  private testimonials: Map<number, Testimonial>;
  
  public sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private petIdCounter: number;
  private resourceIdCounter: number;
  private appointmentIdCounter: number;
  private adoptionApplicationIdCounter: number;
  private testimonialIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.pets = new Map();
    this.resources = new Map();
    this.appointments = new Map();
    this.adoptionApplications = new Map();
    this.testimonials = new Map();
    
    this.userIdCounter = 1;
    this.petIdCounter = 1;
    this.resourceIdCounter = 1;
    this.appointmentIdCounter = 1;
    this.adoptionApplicationIdCounter = 1;
    this.testimonialIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired sessions every 24h
    });
    
    // Initialize with admin user
    this.createUser({
      username: "admin",
      password: "admin", // This will be hashed in auth.ts
      email: "admin@pawpal.com",
      name: "Admin User",
      role: "admin"
    });
    
    // Initialize with sample pets
    this.seedPets();
    
    // Initialize with sample resources
    this.seedResources();
    
    // Initialize with sample testimonials
    this.seedTestimonials();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...userData, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Pet operations
  async getPet(id: number): Promise<Pet | undefined> {
    return this.pets.get(id);
  }
  
  async getPets(filters?: Partial<Pet>): Promise<Pet[]> {
    let pets = Array.from(this.pets.values());
    
    if (filters) {
      pets = pets.filter(pet => {
        let match = true;
        for (const [key, value] of Object.entries(filters)) {
          if (pet[key as keyof Pet] !== value) {
            match = false;
            break;
          }
        }
        return match;
      });
    }
    
    return pets;
  }
  
  async createPet(petData: InsertPet): Promise<Pet> {
    const id = this.petIdCounter++;
    const createdAt = new Date();
    const pet: Pet = { ...petData, id, createdAt };
    this.pets.set(id, pet);
    return pet;
  }
  
  async updatePet(id: number, petData: Partial<Pet>): Promise<Pet | undefined> {
    const pet = await this.getPet(id);
    if (!pet) return undefined;
    
    const updatedPet = { ...pet, ...petData };
    this.pets.set(id, updatedPet);
    return updatedPet;
  }
  
  async deletePet(id: number): Promise<boolean> {
    return this.pets.delete(id);
  }
  
  // Resource operations
  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }
  
  async getResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }
  
  async createResource(resourceData: InsertResource): Promise<Resource> {
    const id = this.resourceIdCounter++;
    const createdAt = new Date();
    const resource: Resource = { ...resourceData, id, createdAt };
    this.resources.set(id, resource);
    return resource;
  }
  
  async updateResource(id: number, resourceData: Partial<Resource>): Promise<Resource | undefined> {
    const resource = await this.getResource(id);
    if (!resource) return undefined;
    
    const updatedResource = { ...resource, ...resourceData };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }
  
  async deleteResource(id: number): Promise<boolean> {
    return this.resources.delete(id);
  }
  
  // Appointment operations
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async getAppointmentsByUser(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.userId === userId,
    );
  }
  
  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const createdAt = new Date();
    const appointment: Appointment = { ...appointmentData, id, status: "scheduled", createdAt };
    this.appointments.set(id, appointment);
    return appointment;
  }
  
  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = await this.getAppointment(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }
  
  // Adoption application operations
  async getAdoptionApplication(id: number): Promise<AdoptionApplication | undefined> {
    return this.adoptionApplications.get(id);
  }
  
  async getAdoptionApplicationsByUser(userId: number): Promise<AdoptionApplication[]> {
    return Array.from(this.adoptionApplications.values()).filter(
      (application) => application.userId === userId,
    );
  }
  
  async getAdoptionApplicationsByPet(petId: number): Promise<AdoptionApplication[]> {
    return Array.from(this.adoptionApplications.values()).filter(
      (application) => application.petId === petId,
    );
  }
  
  async createAdoptionApplication(applicationData: InsertAdoptionApplication): Promise<AdoptionApplication> {
    const id = this.adoptionApplicationIdCounter++;
    const applicationDate = new Date();
    const application: AdoptionApplication = { 
      ...applicationData, 
      id, 
      status: "pending",
      applicationDate 
    };
    this.adoptionApplications.set(id, application);
    return application;
  }
  
  async updateAdoptionApplication(id: number, applicationData: Partial<AdoptionApplication>): Promise<AdoptionApplication | undefined> {
    const application = await this.getAdoptionApplication(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...applicationData };
    this.adoptionApplications.set(id, updatedApplication);
    return updatedApplication;
  }
  
  // Testimonial operations
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    return this.testimonials.get(id);
  }
  
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }
  
  async createTestimonial(testimonialData: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialIdCounter++;
    const createdAt = new Date();
    const testimonial: Testimonial = { ...testimonialData, id, createdAt };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }
  
  async updateTestimonial(id: number, testimonialData: Partial<Testimonial>): Promise<Testimonial | undefined> {
    const testimonial = await this.getTestimonial(id);
    if (!testimonial) return undefined;
    
    const updatedTestimonial = { ...testimonial, ...testimonialData };
    this.testimonials.set(id, updatedTestimonial);
    return updatedTestimonial;
  }
  
  async deleteTestimonial(id: number): Promise<boolean> {
    return this.testimonials.delete(id);
  }
  
  // Seed data functions
  private seedPets(): void {
    const pets = [
      {
        name: "Buddy",
        species: "dog",
        breed: "Golden Retriever",
        age: 24, // 2 years in months
        gender: "male",
        size: "large",
        description: "Buddy is a friendly and energetic Golden Retriever who loves to play fetch and go for long walks.",
        imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d",
        status: "available",
        location: "2.5 miles away",
        healthDetails: "Vaccinated, neutered, healthy",
        goodWith: { kids: true, dogs: true, cats: true }
      },
      {
        name: "Luna",
        species: "cat",
        breed: "Calico",
        age: 12, // 1 year in months
        gender: "female",
        size: "medium",
        description: "Luna is a sweet calico cat who loves to cuddle and play with toy mice. She's very affectionate and purrs loudly.",
        imageUrl: "https://pixabay.com/get/g3bb6f4490aa6f76285aadf37767cf9798bd77c3acda8299d39cfbec737602b7db5be49d81bf085b5122f41cb7d706f6012660533b5ca8cab2238825bc1ba2838_1280.jpg",
        status: "available",
        location: "3.7 miles away",
        healthDetails: "Vaccinated, spayed, healthy",
        goodWith: { kids: true, dogs: false, cats: true }
      },
      {
        name: "Thumper",
        species: "rabbit",
        breed: "Holland Lop",
        age: 8,
        gender: "male",
        size: "small",
        description: "Thumper is a curious and gentle rabbit who loves fresh vegetables and exploring. He's litter-trained and sociable.",
        imageUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308",
        status: "available",
        location: "4.2 miles away",
        healthDetails: "Vaccinated, neutered, healthy",
        goodWith: { kids: true, dogs: false, cats: false }
      },
      {
        name: "Rio",
        species: "bird",
        breed: "Parakeet",
        age: 36, // 3 years in months
        gender: "male",
        size: "small",
        description: "Rio is a colorful and vocal parakeet who loves to sing and interact with people. He can mimic simple words and sounds.",
        imageUrl: "https://pixabay.com/get/gff15e2aaa99eeb7a19b8247da579e3d3c9e72a9d819f5db08bb514b21fc98db360ae6498f257bbd8c047173470f7df6e9370fd59b6ea872e7ef7b01f53cffeb7_1280.jpg",
        status: "available",
        location: "1.8 miles away",
        healthDetails: "Healthy, regular check-ups",
        goodWith: { kids: true, dogs: false, cats: false }
      }
    ];
    
    for (const pet of pets) {
      this.createPet(pet);
    }
  }
  
  private seedResources(): void {
    const resources = [
      {
        title: "New Pet Checklist: Everything You Need",
        content: "A comprehensive guide to help you prepare for your new pet's arrival, including essential supplies and preparation tips.",
        summary: "A comprehensive guide to help you prepare for your new pet's arrival, including essential supplies and preparation tips.",
        category: "Getting Started",
        imageUrl: "https://pixabay.com/get/g30bc767b4029f51d6f50b4a9778aa773282e5492db82626a4947d1e2abf883c0c202f2d76b3fb8efa017fd9a090a562d54d8cae41fb09c0a1284008f870ea07e_1280.jpg"
      },
      {
        title: "Pet Nutrition Guide: Healthy Diets",
        content: "Learn about proper nutrition for different types of pets and how to create a balanced diet for your furry friend.",
        summary: "Learn about proper nutrition for different types of pets and how to create a balanced diet for your furry friend.",
        category: "Nutrition",
        imageUrl: "https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80"
      },
      {
        title: "Basic Training Tips for New Pet Owners",
        content: "Simple yet effective training techniques to help establish good behavior patterns with your newly adopted pet.",
        summary: "Simple yet effective training techniques to help establish good behavior patterns with your newly adopted pet.",
        category: "Training",
        imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb"
      }
    ];
    
    for (const resource of resources) {
      this.createResource(resource);
    }
  }
  
  private seedTestimonials(): void {
    const testimonials = [
      {
        name: "Sarah J.",
        petName: "Max",
        petType: "Golden Retriever",
        content: "We adopted Max last month and he has brought so much joy to our family. The adoption process was smooth and the PawPal team was incredibly helpful throughout.",
        rating: 5,
        imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91"
      },
      {
        name: "Michael & Patricia T.",
        petName: "Luna",
        petType: "Calico Cat",
        content: "After losing our old cat, we were hesitant to adopt again. The PawPal team understood our concerns and helped us find Luna, who has healed our hearts in ways we never expected.",
        rating: 5,
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2"
      },
      {
        name: "David R.",
        petName: "Bella",
        petType: "Beagle Mix",
        content: "Not only did we find our perfect pet, but the resources and support from PawPal have been invaluable. Their vet services are excellent, and the staff truly care about the animals.",
        rating: 4.5,
        imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d"
      }
    ];
    
    for (const testimonial of testimonials) {
      this.createTestimonial(testimonial);
    }
  }
}

export const storage = new MemStorage();
