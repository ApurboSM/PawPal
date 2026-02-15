import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import type { Pet } from "@pawpal/shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  AlertTriangle,
  HeartPulse,
  Phone,
  Search,
  MapPin,
  Clock,
  PawPrint,
  ExternalLink,
  Menu,
  ArrowRight,
  ChevronDown,
  X,
  Plus,
  Edit,
  Trash2,
  Mail,
  CalendarClock,
  Stethoscope,
  FileText,
  UserRound,
  Building
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmergencySectionSkeleton } from "@/components/skeletons/page-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface EmergencyContact {
  id: number;
  name: string;
  phone: string;
  address: string;
  hours: string;
  emergency: boolean;
  distance?: number; // optional for filtering
}

interface FirstAidTip {
  id: number;
  title: string;
  symptoms: string[];
  steps: string[];
  doNot: string[];
  whenToSeek: string;
  petType: string; // "all", "dog", "cat", etc.
}

// User emergency contact interface
interface UserEmergencyContact {
  id: number;
  userId: number;
  contactName: string;
  phone: string;
  address: string;
  isVet: boolean;
  email: string | null;
  notes: string | null;
  createdAt: string;
}

// Pet medical record interface
interface PetMedicalRecord {
  id: number;
  userId: number;
  petId: number;
  recordType: string;
  recordDate: string;
  description: string;
  vetName: string | null;
  attachmentUrl: string | null;
  notes: string | null;
  createdAt: string;
}

// Mock data - in a real app, this would come from the database
const emergencyContacts: EmergencyContact[] = [
  {
    id: 1,
    name: "PawPal Emergency Veterinary Hospital",
    phone: "(555) 123-4567",
    address: "789 Emergency Dr., New York, NY 10001",
    hours: "24/7 Emergency Care",
    emergency: true,
    distance: 2.3
  },
  {
    id: 2,
    name: "Central Animal Hospital",
    phone: "(555) 456-7890",
    address: "456 Pet Care Ave., New York, NY 10002",
    hours: "Mon-Sun: 8AM-10PM, Emergency: 24/7",
    emergency: true,
    distance: 3.8
  },
  {
    id: 3,
    name: "Sunset Pet Clinic",
    phone: "(555) 987-6543",
    address: "123 Healing St., New York, NY 10003",
    hours: "Mon-Fri: 9AM-7PM, Sat: 10AM-4PM",
    emergency: false,
    distance: 1.4
  },
  {
    id: 4,
    name: "Paws & Claws Veterinary Center",
    phone: "(555) 321-7654",
    address: "567 Health Blvd., New York, NY 10004",
    hours: "Mon-Sat: 8AM-8PM, Emergency: Sat-Sun",
    emergency: true,
    distance: 5.2
  },
  {
    id: 5,
    name: "Furry Friends Animal Hospital",
    phone: "(555) 234-5678",
    address: "890 Veterinary Lane, New York, NY 10005",
    hours: "Mon-Sun: 7AM-9PM",
    emergency: false,
    distance: 4.1
  }
];

const firstAidTips: FirstAidTip[] = [
  {
    id: 1,
    title: "Bleeding and Wounds",
    symptoms: ["Active bleeding", "Open wound", "Puncture wound", "Laceration"],
    steps: [
      "Apply direct pressure with a clean cloth or gauze pad",
      "If blood soaks through, add another layer without removing the first",
      "For limb wounds, elevate the limb above heart level if possible",
      "Apply a pressure bandage once bleeding slows",
      "Clean the wound with mild soap and water or saline solution once bleeding is controlled"
    ],
    doNot: [
      "Don't use hydrogen peroxide on deep wounds",
      "Don't remove objects embedded in wounds",
      "Don't apply tourniquets unless directed by a veterinarian"
    ],
    whenToSeek: "Seek immediate veterinary care for heavy bleeding, deep puncture wounds, or wounds near the eyes, chest, or abdomen.",
    petType: "all"
  },
  {
    id: 2,
    title: "Choking",
    symptoms: ["Difficulty breathing", "Excessive pawing at the mouth", "Blue-tinged gums", "Unconsciousness"],
    steps: [
      "If your pet can still breathe, keep them calm and rush to a veterinarian",
      "For a small pet, hold them with their head down and give 5 sharp blows between the shoulder blades",
      "For larger dogs, perform the Heimlich maneuver: place your hands under the rib cage and give quick upward thrusts",
      "If you can see the object, try to remove it with tweezers or pliers, but be careful not to push it further in"
    ],
    doNot: [
      "Don't stick your fingers blindly down your pet's throat",
      "Don't waste time looking for the object if not visible immediately",
      "Don't delay seeking emergency care if first attempts fail"
    ],
    whenToSeek: "Seek immediate emergency care for any choking incident, even if the object is removed and the pet seems fine.",
    petType: "all"
  },
  {
    id: 3,
    title: "Heatstroke",
    symptoms: ["Heavy panting", "Excessive drooling", "Vomiting", "Dizziness or disorientation", "Bright red gums", "Seizures", "Collapse"],
    steps: [
      "Move your pet to a cool, shaded area immediately",
      "Apply cool (not cold) water to the body, especially the neck and underside",
      "Place wet towels over your pet, focusing on head, neck, chest, and groin",
      "Use a fan to increase air flow and cooling",
      "Offer small amounts of cool water to drink"
    ],
    doNot: [
      "Don't use ice-cold water or ice baths, which can cause shock",
      "Don't force water into your pet's mouth",
      "Don't cool your pet too rapidly, which can cause hypothermia"
    ],
    whenToSeek: "Heatstroke is always an emergency. Even if your pet seems to recover, internal organs may have been damaged, so seek veterinary care immediately.",
    petType: "all"
  },
  {
    id: 4,
    title: "Seizures",
    symptoms: ["Sudden loss of consciousness", "Rigid limbs", "Paddling motions", "Uncontrolled urination or defecation", "Excessive drooling"],
    steps: [
      "Remove objects that could harm your pet during the seizure",
      "Keep hands away from the pet's mouth",
      "Time the seizure if possible",
      "Keep your pet away from stairs or ledges",
      "Once the seizure ends, keep your pet calm and quiet"
    ],
    doNot: [
      "Don't try to restrain your pet",
      "Don't put anything in your pet's mouth",
      "Don't try to move your pet unless they're in danger"
    ],
    whenToSeek: "Seek veterinary care immediately for first-time seizures, seizures lasting more than 3 minutes, or multiple seizures in a 24-hour period.",
    petType: "all"
  },
  {
    id: 5,
    title: "Poisoning or Toxin Ingestion",
    symptoms: ["Vomiting", "Diarrhea", "Drooling", "Seizures", "Lethargy", "Loss of appetite", "Pale or yellow gums"],
    steps: [
      "Identify the toxin if possible and remove your pet from the source",
      "Call your veterinarian or pet poison control immediately",
      "If advised, check the product label for treatment instructions",
      "Do not induce vomiting unless directed by a professional",
      "Bring the toxin container/packaging with you to the vet"
    ],
    doNot: [
      "Don't induce vomiting without professional advice",
      "Don't give any home remedies unless directed by a veterinarian",
      "Don't 'wait and see' if symptoms improve"
    ],
    whenToSeek: "Always seek immediate veterinary care for suspected poisoning, even if your pet shows no immediate symptoms.",
    petType: "all"
  },
  {
    id: 6,
    title: "Broken Bones or Fractures",
    symptoms: ["Limping or inability to walk", "Swelling", "Visible bone", "Pain when touched", "Abnormal limb position"],
    steps: [
      "Minimize movement to prevent further injury",
      "Gently place your pet on a flat, sturdy surface for transport",
      "For small pets, use a box or carrier lined with towels",
      "For larger pets, use a board, blanket, or coat as a stretcher",
      "If bleeding, apply gentle pressure with a clean cloth"
    ],
    doNot: [
      "Don't attempt to set or align the bone",
      "Don't give pain medication without veterinary guidance",
      "Don't allow the pet to walk on the injured limb"
    ],
    whenToSeek: "All suspected fractures require immediate veterinary attention.",
    petType: "all"
  },
  {
    id: 7,
    title: "Fish Emergency - Water Quality Issues",
    symptoms: ["Fish gasping at surface", "Rapid gill movement", "Erratic swimming", "Visible distress", "Fish at bottom of tank"],
    steps: [
      "Test water parameters immediately (ammonia, nitrite, nitrate, pH)",
      "Perform an immediate 25-30% water change with dechlorinated water",
      "Ensure water temperature matches tank temperature",
      "Add air stone or increase surface agitation for better oxygenation",
      "Remove any dead plant matter or decaying food"
    ],
    doNot: [
      "Don't change 100% of the water at once",
      "Don't overcrowd the tank during treatment",
      "Don't add medications without identifying the problem"
    ],
    whenToSeek: "Contact a fish specialist or exotic pet veterinarian if multiple fish are affected or symptoms persist after water changes.",
    petType: "fish"
  },
  {
    id: 8,
    title: "Bird Emergency - Respiratory Distress",
    symptoms: ["Tail bobbing when breathing", "Open-mouth breathing", "Stretching neck to breathe", "Voice changes", "Decreased activity"],
    steps: [
      "Move bird to a warm, quiet environment",
      "Maintain temperature at 85-90°F (29-32°C)",
      "Increase humidity with a warm mist humidifier nearby",
      "Remove any potential airborne irritants (smoke, aerosols, etc.)",
      "Place the bird's cage half-covered for security while allowing airflow"
    ],
    doNot: [
      "Don't expose to drafts or temperature fluctuations",
      "Don't use essential oils or strong scents near birds",
      "Don't delay seeking care as birds hide illness until critically ill"
    ],
    whenToSeek: "Respiratory distress in birds is always an emergency requiring immediate veterinary attention.",
    petType: "bird"
  }
];

export default function EmergencyPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPetType, setSelectedPetType] = useState("all");
  const [filterEmergencyOnly, setFilterEmergencyOnly] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [isAddMedicalRecordDialogOpen, setIsAddMedicalRecordDialogOpen] = useState(false);

  const [newContact, setNewContact] = useState({
    contactName: "",
    phone: "",
    address: "",
    email: "",
    isVet: false,
    notes: "",
  });

  const [newMedicalRecord, setNewMedicalRecord] = useState({
    petId: "",
    recordType: "",
    recordDate: "",
    description: "",
    vetName: "",
    notes: "",
  });
  
  // Fetch user's emergency contacts
  const { 
    data: userEmergencyContacts = [], 
    isLoading: isLoadingContacts,
    isError: isErrorContacts
  } = useQuery<UserEmergencyContact[]>({
    queryKey: ['/api/emergency-contacts'],
    enabled: !!user,
  });
  
  // Fetch user's pets' medical records
  const {
    data: petMedicalRecords = [],
    isLoading: isLoadingRecords,
    isError: isErrorRecords
  } = useQuery<PetMedicalRecord[]>({
    queryKey: ['/api/pet-medical-records'],
    enabled: !!user,
  });
  
  // Fetch user's pets for the medical records form
  const {
    data: pets = [],
    isLoading: isLoadingPets
  } = useQuery<Pet[]>({
    queryKey: ['/api/me/pets'],
    enabled: !!user,
  });

  const createContactMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        contactName: newContact.contactName,
        phone: newContact.phone,
        address: newContact.address,
        isVet: Boolean(newContact.isVet),
        email: newContact.email?.trim() ? newContact.email.trim() : null,
        notes: newContact.notes?.trim() ? newContact.notes.trim() : null,
      };
      const res = await apiRequest("POST", "/api/emergency-contacts", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Contact saved",
        description: "Your emergency contact has been added.",
      });
      setIsAddContactDialogOpen(false);
      setNewContact({
        contactName: "",
        phone: "",
        address: "",
        email: "",
        isVet: false,
        notes: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-contacts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save contact",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createMedicalRecordMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        petId: Number(newMedicalRecord.petId),
        recordType: newMedicalRecord.recordType,
        recordDate: new Date(newMedicalRecord.recordDate).toISOString(),
        description: newMedicalRecord.description,
        vetName: newMedicalRecord.vetName?.trim() ? newMedicalRecord.vetName.trim() : null,
        notes: newMedicalRecord.notes?.trim() ? newMedicalRecord.notes.trim() : null,
      };
      const res = await apiRequest("POST", "/api/pet-medical-records", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Record saved",
        description: "Medical record has been added.",
      });
      setIsAddMedicalRecordDialogOpen(false);
      setNewMedicalRecord({
        petId: "",
        recordType: "",
        recordDate: "",
        description: "",
        vetName: "",
        notes: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pet-medical-records"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save record",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete emergency contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: number) => {
      await apiRequest('DELETE', `/api/emergency-contacts/${contactId}`);
    },
    onSuccess: () => {
      toast({
        title: "Contact deleted successfully",
        description: "Your emergency contact has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-contacts'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting contact",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete medical record mutation
  const deleteMedicalRecordMutation = useMutation({
    mutationFn: async (recordId: number) => {
      await apiRequest('DELETE', `/api/pet-medical-records/${recordId}`);
    },
    onSuccess: () => {
      toast({
        title: "Medical record deleted successfully",
        description: "Your pet's medical record has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pet-medical-records'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting medical record",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter first aid tips based on search and pet type
  const filteredTips = firstAidTips.filter(tip => {
    const matchesSearch = 
      tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tip.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPetType = 
      selectedPetType === "all" || 
      tip.petType === "all" || 
      tip.petType === selectedPetType;
    
    return matchesSearch && matchesPetType;
  });

  // Filter emergency contacts based on emergency status
  const filteredContacts = emergencyContacts
    .filter(contact => !filterEmergencyOnly || contact.emergency)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pet Emergency Care | PawPal</title>
        <meta 
          name="description" 
          content="Emergency pet care guidance, first aid instructions, and veterinary contact information for your pet's urgent health needs."
        />
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-50 to-orange-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 opacity-10">
          <div className="absolute top-10 right-10">
            <PawPrint className="w-64 h-64 text-red-500 rotate-12" />
          </div>
          <div className="absolute bottom-10 left-10">
            <PawPrint className="w-48 h-48 text-red-500 -rotate-12" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center bg-red-100 text-red-800 px-4 py-2 rounded-full mb-4">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Emergency Resources</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Pet Emergency <span className="text-red-600">First Aid</span> & Care
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                Quick access to emergency care guidelines, veterinary contacts, and first aid instructions for your pet's urgent health needs.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <a href="#emergency-contacts">
                  <Button variant="default" size="lg" className="bg-red-600 hover:bg-red-700">
                    <Phone className="mr-2 h-5 w-5" />
                    Emergency Contacts
                  </Button>
                </a>
                <a href="#first-aid">
                  <Button variant="outline" size="lg" className="border-red-600 text-red-600 hover:bg-red-50">
                    <HeartPulse className="mr-2 h-5 w-5" />
                    First Aid Instructions
                  </Button>
                </a>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full">
              <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Emergency Hotline
              </h3>
              <p className="text-muted-foreground mb-4">
                Our team is available 24/7 for emergency pet care guidance and support.
              </p>
              <div className="bg-red-50 p-4 rounded-xl mb-4">
                <p className="text-2xl font-bold text-red-600">(555) 123-4567</p>
                <p className="text-sm text-muted-foreground">Available 24/7</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="border-red-200 hover:bg-red-50 flex justify-start">
                  <span className="bg-red-100 p-1.5 rounded-md mr-3">
                    <MapPin className="h-4 w-4 text-red-600" />
                  </span>
                  <span className="text-sm text-left">Find nearest emergency vet</span>
                </Button>
                
                <Button variant="outline" className="border-red-200 hover:bg-red-50 flex justify-start">
                  <span className="bg-red-100 p-1.5 rounded-md mr-3">
                    <HeartPulse className="h-4 w-4 text-red-600" />
                  </span>
                  <span className="text-sm text-left">Video chat with a vet now</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Guidelines Banner */}
        <div className="bg-gradient-to-r from-red-700 to-red-600 text-white py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="font-semibold text-white/95">
                <AlertTriangle className="inline-block mr-2 h-5 w-5 text-white" />
                Always call a veterinarian immediately for serious emergencies
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full md:w-auto bg-transparent text-white border-white/80 hover:bg-white/10 hover:text-white"
                  >
                    What counts as an emergency?
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Pet Emergency Signs</DialogTitle>
                    <DialogDescription>
                      These symptoms require immediate veterinary attention
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Breathing Problems</p>
                        <p className="text-sm text-muted-foreground">Difficulty breathing, choking, excessive panting</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Severe Bleeding</p>
                        <p className="text-sm text-muted-foreground">Bleeding that doesn't stop within 5 minutes</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Trauma or Injury</p>
                        <p className="text-sm text-muted-foreground">Hit by car, falls, broken bones, severe wounds</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Seizures</p>
                        <p className="text-sm text-muted-foreground">First-time seizure or multiple seizures</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Poisoning</p>
                        <p className="text-sm text-muted-foreground">Ingestion of toxic substances</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Difficulty Urinating</p>
                        <p className="text-sm text-muted-foreground">Straining to urinate, especially in male cats</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Bloated Abdomen</p>
                        <p className="text-sm text-muted-foreground">Hard, swollen belly, especially in large dogs</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Collapse/Unconsciousness</p>
                        <p className="text-sm text-muted-foreground">Fainting, inability to stand, extreme weakness</p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="first-aid" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-8 gap-2 sm:gap-0">
            <TabsTrigger value="first-aid" className="text-sm sm:text-base py-3 flex items-center justify-center">
              <HeartPulse className="h-5 w-5 mr-2 hidden sm:inline-block" />
              First Aid Instructions
            </TabsTrigger>
            <TabsTrigger value="emergency-contacts" className="text-sm sm:text-base py-3 flex items-center justify-center">
              <Phone className="h-5 w-5 mr-2 hidden sm:inline-block" />
              Emergency Contacts
            </TabsTrigger>
            <TabsTrigger value="my-emergency-info" className="text-sm sm:text-base py-3 flex items-center justify-center">
              <PawPrint className="h-5 w-5 mr-2 hidden sm:inline-block" />
              My Emergency Info
            </TabsTrigger>
          </TabsList>

          {/* First Aid Tab */}
          <TabsContent value="first-aid" id="first-aid" className="mt-0">
            <div className="mb-8">
              <div className="bg-red-50 border border-red-100 rounded-xl p-6 mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Pet First Aid Guidelines</h2>
                <p className="text-muted-foreground mb-4">
                  Learn how to handle common pet emergencies until you can get to a veterinarian. 
                  These instructions are not a substitute for professional veterinary care.
                </p>
                <div className="flex flex-wrap gap-4 mb-6">
                  <Button 
                    variant={selectedPetType === "all" ? "default" : "outline"}
                    onClick={() => setSelectedPetType("all")}
                    className={selectedPetType === "all" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    All Pets
                  </Button>
                  <Button 
                    variant={selectedPetType === "dog" ? "default" : "outline"}
                    onClick={() => setSelectedPetType("dog")}
                    className={selectedPetType === "dog" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    Dogs
                  </Button>
                  <Button 
                    variant={selectedPetType === "cat" ? "default" : "outline"}
                    onClick={() => setSelectedPetType("cat")}
                    className={selectedPetType === "cat" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    Cats
                  </Button>
                  <Button 
                    variant={selectedPetType === "bird" ? "default" : "outline"}
                    onClick={() => setSelectedPetType("bird")}
                    className={selectedPetType === "bird" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    Birds
                  </Button>
                  <Button 
                    variant={selectedPetType === "fish" ? "default" : "outline"}
                    onClick={() => setSelectedPetType("fish")}
                    className={selectedPetType === "fish" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    Fish
                  </Button>
                  <Button 
                    variant={selectedPetType === "small_pet" ? "default" : "outline"}
                    onClick={() => setSelectedPetType("small_pet")}
                    className={selectedPetType === "small_pet" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    Small Pets
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search symptoms or emergencies..."
                    className="pl-10 border-red-200 focus:border-red-400 focus:ring-red-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filteredTips.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredTips.map((tip) => (
                    <AccordionItem 
                      key={tip.id}
                      value={`item-${tip.id}`}
                      className="border border-muted rounded-lg overflow-hidden"
                    >
                      <AccordionTrigger className="bg-white px-6 py-4 hover:no-underline hover:bg-muted/20">
                        <div className="flex items-center text-left">
                          <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center mr-4
                            ${tip.petType === "all" ? "bg-red-100 text-red-600" : 
                              tip.petType === "dog" ? "bg-amber-100 text-amber-600" : 
                              tip.petType === "cat" ? "bg-purple-100 text-purple-600" : 
                              tip.petType === "bird" ? "bg-blue-100 text-blue-600" : 
                              tip.petType === "fish" ? "bg-cyan-100 text-cyan-600" : 
                              "bg-green-100 text-green-600"}
                          `}>
                            <HeartPulse className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">{tip.title}</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {tip.symptoms.slice(0, 2).map((symptom, index) => (
                                <span key={index} className="inline-flex text-xs bg-muted rounded-full px-2 py-1">
                                  {symptom}
                                </span>
                              ))}
                              {tip.symptoms.length > 2 && (
                                <span className="inline-flex text-xs bg-muted rounded-full px-2 py-1">
                                  +{tip.symptoms.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="bg-white px-6 pt-0 pb-4">
                        <div className="pl-16 border-l-2 border-red-100 ml-6 mt-4">
                          <h4 className="text-lg font-medium mb-2">Symptoms:</h4>
                          <ul className="list-disc pl-5 mb-4 space-y-1">
                            {tip.symptoms.map((symptom, index) => (
                              <li key={index} className="text-muted-foreground">{symptom}</li>
                            ))}
                          </ul>
                          
                          <h4 className="text-lg font-medium mb-2">First Aid Steps:</h4>
                          <ol className="list-decimal pl-5 mb-4 space-y-2">
                            {tip.steps.map((step, index) => (
                              <li key={index} className="text-foreground">{step}</li>
                            ))}
                          </ol>
                          
                          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
                            <h4 className="text-lg font-medium text-red-700 mb-2">Do NOT:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {tip.doNot.map((item, index) => (
                                <li key={index} className="text-red-800">{item}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                            <h4 className="text-lg font-medium text-amber-700 mb-1">When to Seek Emergency Care:</h4>
                            <p className="text-amber-800">{tip.whenToSeek}</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-xl">
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-xl font-medium text-foreground mb-2">No matching first aid tips found</h3>
                  <p className="text-muted-foreground">Try adjusting your search terms or pet type filter</p>
                </div>
              )}
              
              <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="bg-amber-100 p-4 rounded-full">
                    <AlertTriangle className="h-8 w-8 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Important Reminder</h3>
                    <p className="text-muted-foreground mb-4">
                      These first aid guidelines are designed to help you stabilize your pet until 
                      you can reach a veterinarian. They are not a substitute for professional care.
                    </p>
                    <p className="text-sm bg-white p-3 rounded-lg border border-amber-200">
                      <strong>Always call your veterinarian or an emergency animal hospital</strong> when 
                      your pet is experiencing a medical emergency, even while administering first aid.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Emergency Contacts Tab */}
          <TabsContent value="emergency-contacts" id="emergency-contacts" className="mt-0">
            <div className="mb-8">
              <div className="bg-red-50 border border-red-100 rounded-xl p-6 mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Emergency Veterinary Contacts</h2>
                <p className="text-muted-foreground mb-4">
                  Find nearby emergency veterinary hospitals and clinics. Keep these contacts handy for quick access during emergencies.
                </p>
                <div className="flex items-center mb-4">
                  <div className="flex items-center space-x-2 mr-4">
                    <input
                      type="checkbox"
                      id="emergency-only"
                      checked={filterEmergencyOnly}
                      onChange={() => setFilterEmergencyOnly(!filterEmergencyOnly)}
                      className="rounded border-red-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="emergency-only" className="text-sm font-medium">
                      Show 24/7 emergency services only
                    </label>
                  </div>
                  <div className="ml-auto">
                    <Button variant="outline" className="border-red-200 hover:bg-red-50">
                      <MapPin className="h-4 w-4 mr-2" />
                      Use my location
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredContacts.map((contact) => (
                  <Card key={contact.id} className="overflow-hidden border-muted">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div 
                          className={cn(
                            "p-6 md:w-3/5 border-b md:border-b-0 md:border-r border-muted",
                            contact.emergency ? "bg-gradient-to-r from-red-50 to-white" : ""
                          )}
                        >
                          <div className="flex items-center mb-3">
                            {contact.emergency && (
                              <span className="inline-flex items-center bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full mr-2">
                                <Clock className="h-3 w-3 mr-1" />
                                24/7 Emergency
                              </span>
                            )}
                            {contact.distance && (
                              <span className="inline-flex items-center bg-muted text-xs px-2.5 py-1 rounded-full">
                                <MapPin className="h-3 w-3 mr-1" />
                                {contact.distance} miles away
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-bold text-foreground mb-2">{contact.name}</h3>
                          
                          <div className="flex items-start mb-3">
                            <MapPin className="h-5 w-5 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-muted-foreground">{contact.address}</p>
                          </div>
                          
                          <div className="flex items-start">
                            <Clock className="h-5 w-5 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-muted-foreground">{contact.hours}</p>
                          </div>
                        </div>
                        
                        <div className="p-6 md:w-2/5 bg-white flex flex-col justify-center">
                          <a 
                            href={`tel:${contact.phone.replace(/\D/g,'')}`}
                            className={cn(
                              "w-full inline-flex items-center justify-center rounded-lg px-6 py-3 mb-3 font-medium",
                              contact.emergency 
                                ? "bg-red-600 text-white hover:bg-red-700" 
                                : "bg-primary text-white hover:bg-primary/90"
                            )}
                          >
                            <Phone className="h-5 w-5 mr-2" />
                            {contact.phone}
                          </a>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button variant="outline" className="text-sm">
                              <MapPin className="h-4 w-4 mr-2" />
                              Directions
                            </Button>
                            <Button variant="outline" className="text-sm">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Website
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* My Emergency Info Tab */}
          <TabsContent value="my-emergency-info" id="my-emergency-info" className="mt-0">
            <div className="mb-8">
              {!user ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">Sign in to manage your emergency information</h3>
                  <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
                    Create and manage your emergency contacts and pet medical records to have critical information ready when you need it most.
                  </p>
                  <Link href="/auth">
                    <Button className="bg-amber-600 hover:bg-amber-700">
                      Sign in or Create an Account
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">My Emergency Information</h2>
                        <p className="text-muted-foreground">
                          Store important emergency contacts and pet medical records for quick access during emergencies.
                        </p>
                      </div>
                      <div className="flex mt-4 md:mt-0 space-x-3">
                        <Dialog open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="bg-red-600 hover:bg-red-700">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Emergency Contact
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Emergency Contact</DialogTitle>
                              <DialogDescription>
                                Add a veterinarian, pet sitter, or other emergency contact for your pets.
                              </DialogDescription>
                            </DialogHeader>
                            {/* Contact form will go here */}
                            <div className="grid gap-4 py-4">
                              <div>
                                <label htmlFor="contactName" className="block text-sm font-medium mb-1">Contact Name *</label>
                                <Input
                                  id="contactName"
                                  placeholder="Dr. Smith Veterinary Clinic"
                                  value={newContact.contactName}
                                  onChange={(e) => setNewContact((p) => ({ ...p, contactName: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number *</label>
                                <Input
                                  id="phone"
                                  placeholder="(555) 123-4567"
                                  value={newContact.phone}
                                  onChange={(e) => setNewContact((p) => ({ ...p, phone: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label htmlFor="address" className="block text-sm font-medium mb-1">Address *</label>
                                <Input
                                  id="address"
                                  placeholder="123 Main St, City, State, ZIP"
                                  value={newContact.address}
                                  onChange={(e) => setNewContact((p) => ({ ...p, address: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-1">Email (optional)</label>
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder="contact@example.com"
                                  value={newContact.email}
                                  onChange={(e) => setNewContact((p) => ({ ...p, email: e.target.value }))}
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="isVet"
                                  className="rounded border-red-300 text-red-600 focus:ring-red-500"
                                  checked={newContact.isVet}
                                  onChange={(e) => setNewContact((p) => ({ ...p, isVet: e.target.checked }))}
                                />
                                <label htmlFor="isVet" className="text-sm font-medium">
                                  This is a veterinarian/veterinary hospital
                                </label>
                              </div>
                              <div>
                                <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes (optional)</label>
                                <textarea
                                  id="notes"
                                  rows={3}
                                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="Any additional information about this contact"
                                  value={newContact.notes}
                                  onChange={(e) => setNewContact((p) => ({ ...p, notes: e.target.value }))}
                                ></textarea>
                              </div>
                            </div>
                            <div className="flex justify-end gap-3">
                              <Button variant="outline" onClick={() => setIsAddContactDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                className="bg-red-600 hover:bg-red-700"
                                disabled={
                                  createContactMutation.isPending ||
                                  !newContact.contactName.trim() ||
                                  !newContact.phone.trim() ||
                                  !newContact.address.trim()
                                }
                                onClick={() => createContactMutation.mutate()}
                              >
                                Save Contact
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isAddMedicalRecordDialogOpen} onOpenChange={setIsAddMedicalRecordDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="bg-red-600 hover:bg-red-700">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Medical Record
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Pet Medical Record</DialogTitle>
                              <DialogDescription>
                                Track important medical information for your pets.
                              </DialogDescription>
                            </DialogHeader>
                            {/* Medical record form will go here */}
                            <div className="grid gap-4 py-4">
                              <div>
                                <label htmlFor="pet" className="block text-sm font-medium mb-1">Pet *</label>
                                <select 
                                  id="pet" 
                                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  value={newMedicalRecord.petId}
                                  onChange={(e) => setNewMedicalRecord((p) => ({ ...p, petId: e.target.value }))}
                                >
                                  <option value="">Select a pet</option>
                                  {pets.map(pet => (
                                    <option key={pet.id} value={pet.id}>{pet.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label htmlFor="recordType" className="block text-sm font-medium mb-1">Record Type *</label>
                                <select 
                                  id="recordType" 
                                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  value={newMedicalRecord.recordType}
                                  onChange={(e) => setNewMedicalRecord((p) => ({ ...p, recordType: e.target.value }))}
                                >
                                  <option value="">Select record type</option>
                                  <option value="Vaccination">Vaccination</option>
                                  <option value="Surgery">Surgery</option>
                                  <option value="Medication">Medication</option>
                                  <option value="Examination">Examination</option>
                                  <option value="Allergy">Allergy</option>
                                  <option value="Condition">Chronic Condition</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div>
                                <label htmlFor="recordDate" className="block text-sm font-medium mb-1">Date *</label>
                                <Input
                                  id="recordDate"
                                  type="date"
                                  value={newMedicalRecord.recordDate}
                                  onChange={(e) => setNewMedicalRecord((p) => ({ ...p, recordDate: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label htmlFor="description" className="block text-sm font-medium mb-1">Description *</label>
                                <Input
                                  id="description"
                                  placeholder="Rabies vaccination"
                                  value={newMedicalRecord.description}
                                  onChange={(e) => setNewMedicalRecord((p) => ({ ...p, description: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label htmlFor="vetName" className="block text-sm font-medium mb-1">Veterinarian (optional)</label>
                                <Input
                                  id="vetName"
                                  placeholder="Dr. Smith"
                                  value={newMedicalRecord.vetName}
                                  onChange={(e) => setNewMedicalRecord((p) => ({ ...p, vetName: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes (optional)</label>
                                <textarea
                                  id="notes"
                                  rows={3}
                                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="Additional information about this medical record"
                                  value={newMedicalRecord.notes}
                                  onChange={(e) => setNewMedicalRecord((p) => ({ ...p, notes: e.target.value }))}
                                ></textarea>
                              </div>
                            </div>
                            <div className="flex justify-end gap-3">
                              <Button variant="outline" onClick={() => setIsAddMedicalRecordDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                className="bg-red-600 hover:bg-red-700"
                                disabled={
                                  createMedicalRecordMutation.isPending ||
                                  !newMedicalRecord.petId ||
                                  !newMedicalRecord.recordType ||
                                  !newMedicalRecord.recordDate ||
                                  !newMedicalRecord.description.trim()
                                }
                                onClick={() => createMedicalRecordMutation.mutate()}
                              >
                                Save Record
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                  
                  {/* Emergency Contacts Section */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-red-600" />
                      My Emergency Contacts
                    </h3>
                    
                    {isLoadingContacts ? (
                      <EmergencySectionSkeleton />
                    ) : isErrorContacts ? (
                      <div className="text-center py-12 bg-muted/20 rounded-xl">
                        <AlertTriangle className="h-12 w-12 mx-auto text-red-400 mb-3" />
                        <h3 className="text-xl font-medium text-foreground mb-2">Unable to load contacts</h3>
                        <p className="text-muted-foreground">There was a problem loading your emergency contacts. Please try again later.</p>
                      </div>
                    ) : userEmergencyContacts.length === 0 ? (
                      <div className="text-center py-12 bg-muted/20 rounded-xl">
                        <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <h3 className="text-xl font-medium text-foreground mb-2">No emergency contacts yet</h3>
                        <p className="text-muted-foreground mb-4">Add important contacts like your veterinarian, pet sitter, or pet-friendly neighbor.</p>
                        <Button 
                          onClick={() => setIsAddContactDialogOpen(true)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Emergency Contact
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {userEmergencyContacts.map((contact) => (
                          <Card key={contact.id} className="overflow-hidden border-muted">
                            <CardContent className="p-0">
                              <div className="flex flex-col md:flex-row">
                                <div className="p-6 md:w-3/4 border-b md:border-b-0 md:border-r border-muted">
                                  <div className="flex items-center mb-3">
                                    {contact.isVet && (
                                      <span className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full mr-2">
                                        <Stethoscope className="w-3 h-3 mr-1" />
                                        Veterinarian
                                      </span>
                                    )}
                                  </div>
                                  
                                  <h3 className="text-xl font-bold text-foreground mb-1">{contact.contactName}</h3>
                                  
                                  <div className="flex items-start mb-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1 mr-2 flex-shrink-0" />
                                    <p className="text-muted-foreground text-sm">{contact.address}</p>
                                  </div>
                                  
                                  <div className="flex items-start mb-2">
                                    <Phone className="h-4 w-4 text-muted-foreground mt-1 mr-2 flex-shrink-0" />
                                    <p className="text-sm font-medium">{contact.phone}</p>
                                  </div>
                                  
                                  {contact.email && (
                                    <div className="flex items-start mb-2">
                                      <Mail className="h-4 w-4 text-muted-foreground mt-1 mr-2 flex-shrink-0" />
                                      <p className="text-sm">{contact.email}</p>
                                    </div>
                                  )}
                                  
                                  {contact.notes && (
                                    <div className="flex items-start mt-3 pt-3 border-t border-muted">
                                      <p className="text-sm text-muted-foreground">{contact.notes}</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="p-6 md:w-1/4 flex flex-col justify-center gap-3">
                                  <Button className="w-full bg-red-600 hover:bg-red-700">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call
                                  </Button>
                                  
                                  <Button variant="outline" className="w-full border-muted-foreground/20">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Button>
                                  
                                  <Button 
                                    variant="outline" 
                                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => deleteContactMutation.mutate(contact.id)}
                                    disabled={deleteContactMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {deleteContactMutation.isPending ? 'Deleting...' : 'Delete'}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Pet Medical Records Section */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-red-600" />
                      Pet Medical Records
                    </h3>
                    
                    {isLoadingRecords ? (
                      <EmergencySectionSkeleton />
                    ) : isErrorRecords ? (
                      <div className="text-center py-12 bg-muted/20 rounded-xl">
                        <AlertTriangle className="h-12 w-12 mx-auto text-red-400 mb-3" />
                        <h3 className="text-xl font-medium text-foreground mb-2">Unable to load medical records</h3>
                        <p className="text-muted-foreground">There was a problem loading your pet's medical records. Please try again later.</p>
                      </div>
                    ) : petMedicalRecords.length === 0 ? (
                      <div className="text-center py-12 bg-muted/20 rounded-xl">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <h3 className="text-xl font-medium text-foreground mb-2">No medical records yet</h3>
                        <p className="text-muted-foreground mb-4">Keep track of important medical information like vaccinations, allergies, and procedures.</p>
                        <Button 
                          onClick={() => setIsAddMedicalRecordDialogOpen(true)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Medical Record
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {petMedicalRecords.map((record) => {
                          const pet = pets.find(p => p.id === record.petId);
                          return (
                            <Card key={record.id} className="overflow-hidden border-muted">
                              <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                  <div className="p-6 md:w-3/4 border-b md:border-b-0 md:border-r border-muted">
                                    <div className="flex items-center mb-3">
                                      <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full mr-2">
                                        {record.recordType}
                                      </span>
                                      {pet && (
                                        <span className="inline-flex items-center bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full">
                                          <PawPrint className="w-3 h-3 mr-1" />
                                          {pet.name}
                                        </span>
                                      )}
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-foreground mb-1">{record.description}</h3>
                                    
                                    <div className="flex items-start mb-2">
                                      <CalendarClock className="h-4 w-4 text-muted-foreground mt-1 mr-2 flex-shrink-0" />
                                      <p className="text-muted-foreground text-sm">
                                        Date: {new Date(record.recordDate).toLocaleDateString()}
                                      </p>
                                    </div>
                                    
                                    {record.vetName && (
                                      <div className="flex items-start mb-2">
                                        <UserRound className="h-4 w-4 text-muted-foreground mt-1 mr-2 flex-shrink-0" />
                                        <p className="text-sm">Veterinarian: {record.vetName}</p>
                                      </div>
                                    )}
                                    
                                    {record.notes && (
                                      <div className="flex items-start mt-3 pt-3 border-t border-muted">
                                        <p className="text-sm text-muted-foreground">{record.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="p-6 md:w-1/4 flex flex-col justify-center gap-3">
                                    <Button variant="outline" className="w-full border-muted-foreground/20">
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </Button>
                                    
                                    <Button 
                                      variant="outline" 
                                      className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                      onClick={() => deleteMedicalRecordMutation.mutate(record.id)}
                                      disabled={deleteMedicalRecordMutation.isPending}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      {deleteMedicalRecordMutation.isPending ? 'Deleting...' : 'Delete'}
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                      <div className="bg-amber-100 p-4 rounded-full">
                        <AlertTriangle className="h-8 w-8 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Important Information</h3>
                        <p className="text-muted-foreground mb-4">
                          Your emergency contacts and medical records are stored securely and are only accessible to you.
                          Having this information readily available can be crucial during emergencies.
                        </p>
                        <p className="text-sm bg-white p-3 rounded-lg border border-amber-200">
                          <strong>Pro Tip:</strong> Consider printing a copy of your pet's most important medical 
                          information and emergency contacts to keep in your car or pet carrier.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Pet Emergency Kit Section */}
      <section className="bg-gradient-to-r from-red-50 to-orange-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Build Your Pet Emergency Kit
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Being prepared can save precious time during an emergency. 
              Keep these essential items in an accessible location.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/80 backdrop-blur-sm border-red-100">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
                  <span className="bg-red-100 p-2 rounded-lg mr-3">
                    <HeartPulse className="h-6 w-6 text-red-600" />
                  </span>
                  First Aid Supplies
                </h3>
                <ul className="space-y-3">
                  {[
                    "Digital thermometer (normal temperature: 99.5-102.5°F for dogs, 100.5-102.5°F for cats)",
                    "Gauze pads and rolls for wrapping wounds",
                    "Adhesive medical tape for securing bandages",
                    "Hydrogen peroxide 3% (to induce vomiting only when directed by a veterinarian)",
                    "Saline eye solution for flushing wounds",
                    "Antiseptic wipes or solution",
                    "Blunt-end scissors for cutting bandages",
                    "Tweezers for removing small foreign objects",
                    "Disposable gloves",
                    "Muzzle or soft cloth to prevent biting"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-red-100 p-1 rounded-full mr-2 mt-1">
                        <PawPrint className="h-3 w-3 text-red-600" />
                      </div>
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-red-100">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
                  <span className="bg-amber-100 p-2 rounded-lg mr-3">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </span>
                  Documentation & Medications
                </h3>
                <ul className="space-y-3">
                  {[
                    "Current photos of your pets (for identification if lost)",
                    "Copies of vaccination records",
                    "List of current medications and dosages",
                    "Your veterinarian's contact information",
                    "Nearest emergency veterinary hospital information",
                    "Pet poison control center number (888-426-4435)",
                    "Pet first-aid reference guide or app",
                    "Any current prescription medications your pet takes",
                    "Pet insurance information (if applicable)",
                    "Medical history summary for each pet"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-amber-100 p-1 rounded-full mr-2 mt-1">
                        <PawPrint className="h-3 w-3 text-amber-600" />
                      </div>
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-red-100">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
                  <span className="bg-blue-100 p-2 rounded-lg mr-3">
                    <HeartPulse className="h-6 w-6 text-blue-600" />
                  </span>
                  Transport & Comfort Items
                </h3>
                <ul className="space-y-3">
                  {[
                    "Pet carrier or crate for each pet",
                    "Blankets or towels for shock, warmth or comfort",
                    "Stretcher (can be improvised with a board or blanket)",
                    "Pet-specific restraints (leashes, harnesses)",
                    "Muzzle or cloth strips to prevent biting when in pain",
                    "Water and collapsible bowls",
                    "Small amount of your pet's regular food",
                    "Flashlight with extra batteries",
                    "Styptic powder (for nail bleeding)",
                    "Liquid dish soap (for bathing after toxin exposure)"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-blue-100 p-1 rounded-full mr-2 mt-1">
                        <PawPrint className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Button className="bg-red-600 hover:bg-red-700">
                Download Complete Pet Emergency Checklist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Mobile menu - for small screens */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-muted z-50">
        <div className="flex justify-around">
          <a href="#" className="flex flex-col items-center py-3 flex-1">
            <HeartPulse className="h-6 w-6 text-red-600" />
            <span className="text-xs mt-1">First Aid</span>
          </a>
          <a href="#emergency-contacts" className="flex flex-col items-center py-3 flex-1">
            <Phone className="h-6 w-6 text-red-600" />
            <span className="text-xs mt-1">Contacts</span>
          </a>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex flex-col items-center py-3 flex-1"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-red-600" />
            ) : (
              <Menu className="h-6 w-6 text-red-600" />
            )}
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}