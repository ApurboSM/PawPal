import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Pet, Resource, AdoptionApplication, User } from "@pawpal/shared/schema";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ListRowsSkeleton } from "@/components/skeletons/page-skeletons";

// Pet form schema
const petFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().min(1, "Breed is required"),
  age: z.coerce.number().min(0, "Age must be a positive number"),
  gender: z.string().min(1, "Gender is required"),
  size: z.string().min(1, "Size is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().url("Please enter a valid URL for the image"),
  status: z.string().min(1, "Status is required"),
  location: z.string().min(1, "Location is required"),
  healthDetails: z.string().min(1, "Health details are required"),
  goodWith: z.object({
    kids: z.boolean().default(false),
    dogs: z.boolean().default(false),
    cats: z.boolean().default(false),
  }),
});

// Resource form schema
const resourceFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Please enter a valid URL for the image"),
});

type PetFormValues = z.infer<typeof petFormSchema>;
type ResourceFormValues = z.infer<typeof resourceFormSchema>;

export default function AdminPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State for entity management
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [isEditPetOpen, setIsEditPetOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isDeletePetOpen, setIsDeletePetOpen] = useState(false);
  
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [isEditResourceOpen, setIsEditResourceOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isDeleteResourceOpen, setIsDeleteResourceOpen] = useState(false);
  
  const [selectedApplication, setSelectedApplication] = useState<AdoptionApplication | null>(null);
  const [isUpdateApplicationOpen, setIsUpdateApplicationOpen] = useState(false);
  
  // Search and filter state
  const [petSearch, setPetSearch] = useState("");
  const [applicationFilter, setApplicationFilter] = useState<string>("");

  // Fetch entities
  const {
    data: pets,
    isLoading: isPetsLoading,
    refetch: refetchPets,
  } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
  });

  const {
    data: resources,
    isLoading: isResourcesLoading,
    refetch: refetchResources,
  } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  // Pet form
  const petForm = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      age: 0,
      gender: "",
      size: "",
      description: "",
      imageUrl: "",
      status: "available",
      location: "",
      healthDetails: "",
      goodWith: {
        kids: false,
        dogs: false,
        cats: false,
      },
    },
  });

  // Resource form
  const resourceForm = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: "",
      content: "",
      summary: "",
      category: "",
      imageUrl: "",
    },
  });

  // Application form for updating status
  const applicationForm = useForm({
    defaultValues: {
      status: "pending",
    },
  });

  // Mutations
  const createPetMutation = useMutation({
    mutationFn: async (data: PetFormValues) => {
      const response = await apiRequest("POST", "/api/pets", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pet Added",
        description: "The pet has been successfully added.",
      });
      setIsAddPetOpen(false);
      petForm.reset();
      refetchPets();
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Pet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PetFormValues }) => {
      const response = await apiRequest("PUT", `/api/pets/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pet Updated",
        description: "The pet has been successfully updated.",
      });
      setIsEditPetOpen(false);
      setSelectedPet(null);
      refetchPets();
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Pet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePetMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/pets/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Pet Deleted",
        description: "The pet has been successfully deleted.",
      });
      setIsDeletePetOpen(false);
      setSelectedPet(null);
      refetchPets();
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Pet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createResourceMutation = useMutation({
    mutationFn: async (data: ResourceFormValues) => {
      const response = await apiRequest("POST", "/api/resources", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Resource Added",
        description: "The resource has been successfully added.",
      });
      setIsAddResourceOpen(false);
      resourceForm.reset();
      refetchResources();
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Resource",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateResourceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ResourceFormValues }) => {
      const response = await apiRequest("PUT", `/api/resources/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Resource Updated",
        description: "The resource has been successfully updated.",
      });
      setIsEditResourceOpen(false);
      setSelectedResource(null);
      refetchResources();
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Resource",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/resources/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Resource Deleted",
        description: "The resource has been successfully deleted.",
      });
      setIsDeleteResourceOpen(false);
      setSelectedResource(null);
      refetchResources();
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Resource",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/adoption-applications/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Updated",
        description: "The application status has been successfully updated.",
      });
      setIsUpdateApplicationOpen(false);
      setSelectedApplication(null);
      refetchApplications();
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Application",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // For applications, we need to fetch by each pet
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [isApplicationsLoading, setIsApplicationsLoading] = useState(true);

  const refetchApplications = async () => {
    setIsApplicationsLoading(true);
    if (pets && pets.length > 0) {
      try {
        const appPromises = pets.map(pet => 
          fetch(`/api/pets/${pet.id}/adoption-applications`, {
            credentials: 'include'
          }).then(res => res.json())
        );
        
        const appResults = await Promise.all(appPromises);
        setApplications(appResults.flat());
      } catch (error) {
        console.error("Failed to fetch applications:", error);
        toast({
          title: "Error",
          description: "Failed to fetch adoption applications.",
          variant: "destructive",
        });
      } finally {
        setIsApplicationsLoading(false);
      }
    } else {
      setApplications([]);
      setIsApplicationsLoading(false);
    }
  };

  // Fetch users for application display
  const { data: allUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: false, // We don't have this endpoint, so disable
  });
  
  // Dummy user data for displaying in applications since we don't have the endpoint
  const dummyUsers = [
    { id: 1, name: "Admin User", email: "admin@pawpal.com" },
    { id: 2, name: "John Doe", email: "john@example.com" },
    { id: 3, name: "Jane Smith", email: "jane@example.com" },
  ];

  // Get username by ID (would normally use allUsers)
  const getUserName = (userId: number) => {
    const user = dummyUsers.find(u => u.id === userId);
    return user ? user.name : `User ${userId}`;
  };

  // Get pet name by ID
  const getPetName = (petId: number) => {
    if (!pets) return `Pet ${petId}`;
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.name : `Pet ${petId}`;
  };

  // Filtered applications
  const filteredApplications = applications.filter(app => {
    if (!applicationFilter) return true;
    return app.status === applicationFilter;
  });

  // Filtered pets
  const filteredPets = pets?.filter(pet => {
    if (!petSearch) return true;
    const searchLower = petSearch.toLowerCase();
    return (
      pet.name.toLowerCase().includes(searchLower) ||
      pet.breed.toLowerCase().includes(searchLower) ||
      pet.species.toLowerCase().includes(searchLower)
    );
  });

  // Set form values when editing
  useEffect(() => {
    if (selectedPet && isEditPetOpen) {
      petForm.reset({
        name: selectedPet.name,
        species: selectedPet.species,
        breed: selectedPet.breed,
        age: selectedPet.age,
        gender: selectedPet.gender,
        size: selectedPet.size,
        description: selectedPet.description,
        imageUrl: selectedPet.imageUrl,
        status: selectedPet.status,
        location: selectedPet.location,
        healthDetails: selectedPet.healthDetails,
        goodWith: selectedPet.goodWith,
      });
    }
  }, [selectedPet, isEditPetOpen, petForm]);

  useEffect(() => {
    if (selectedResource && isEditResourceOpen) {
      resourceForm.reset({
        title: selectedResource.title,
        content: selectedResource.content,
        summary: selectedResource.summary,
        category: selectedResource.category,
        imageUrl: selectedResource.imageUrl,
      });
    }
  }, [selectedResource, isEditResourceOpen, resourceForm]);

  useEffect(() => {
    if (selectedApplication && isUpdateApplicationOpen) {
      applicationForm.reset({
        status: selectedApplication.status,
      });
    }
  }, [selectedApplication, isUpdateApplicationOpen, applicationForm]);

  // Fetch applications when pets are loaded
  useEffect(() => {
    if (pets) {
      refetchApplications();
    }
  }, [pets]);

  // Form submission handlers
  const onAddPet = (data: PetFormValues) => {
    createPetMutation.mutate(data);
  };

  const onEditPet = (data: PetFormValues) => {
    if (selectedPet) {
      updatePetMutation.mutate({ id: selectedPet.id, data });
    }
  };

  const onDeletePet = () => {
    if (selectedPet) {
      deletePetMutation.mutate(selectedPet.id);
    }
  };

  const onAddResource = (data: ResourceFormValues) => {
    createResourceMutation.mutate(data);
  };

  const onEditResource = (data: ResourceFormValues) => {
    if (selectedResource) {
      updateResourceMutation.mutate({ id: selectedResource.id, data });
    }
  };

  const onDeleteResource = () => {
    if (selectedResource) {
      deleteResourceMutation.mutate(selectedResource.id);
    }
  };

  const onUpdateApplication = (data: { status: string }) => {
    if (selectedApplication) {
      updateApplicationMutation.mutate({ id: selectedApplication.id, status: data.status });
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - PawPal</title>
        <meta name="description" content="Admin dashboard for managing pets, applications, resources, and more on the PawPal pet adoption platform." />
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen bg-neutral-100 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-lg text-neutral-600 mb-8">
            Manage pets, adoption applications, resources, and appointments.
          </p>
          
          <Tabs defaultValue="pets" className="space-y-8">
            <TabsList className="w-full grid grid-cols-3 md:grid-cols-4 lg:max-w-xl">
              <TabsTrigger value="pets">Pets</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
            </TabsList>
            
            {/* Pets Management */}
            <TabsContent value="pets">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle>Pets Management</CardTitle>
                    <CardDescription>
                      Add, edit, and remove pets from the adoption platform.
                    </CardDescription>
                  </div>
                  <Button 
                    className="bg-[#47B881] hover:bg-[#3A9268]"
                    onClick={() => setIsAddPetOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Pet
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-6">
                    <div className="relative max-w-sm w-full">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                      <Input
                        placeholder="Search by name, breed, or species"
                        value={petSearch}
                        onChange={(e) => setPetSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  {isPetsLoading ? (
                    <ListRowsSkeleton rows={4} />
                  ) : filteredPets && filteredPets.length > 0 ? (
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Breed</TableHead>
                            <TableHead>Species</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPets.map((pet) => (
                            <TableRow key={pet.id}>
                              <TableCell className="font-medium">{pet.name}</TableCell>
                              <TableCell>{pet.breed}</TableCell>
                              <TableCell className="capitalize">{pet.species}</TableCell>
                              <TableCell>
                                <Badge
                                  className={`${
                                    pet.status === "available"
                                      ? "bg-[#47B881]"
                                      : pet.status === "adopted"
                                      ? "bg-[#4A6FA5]"
                                      : pet.status === "pending"
                                      ? "bg-amber-500"
                                      : "bg-neutral-500"
                                  }`}
                                >
                                  {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {pet.age < 12
                                  ? `${pet.age} month${pet.age !== 1 ? "s" : ""}`
                                  : `${Math.floor(pet.age / 12)} year${
                                      Math.floor(pet.age / 12) !== 1 ? "s" : ""
                                    }`}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPet(pet);
                                      setIsEditPetOpen(true);
                                    }}
                                    className="text-[#4A6FA5] border-[#4A6FA5]"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPet(pet);
                                      setIsDeletePetOpen(true);
                                    }}
                                    className="text-red-500 border-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-500">No pets found. Add a pet to get started.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Add Pet Dialog */}
              <Dialog open={isAddPetOpen} onOpenChange={setIsAddPetOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Pet</DialogTitle>
                    <DialogDescription>
                      Fill out the form below to add a new pet to the adoption platform.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...petForm}>
                    <form onSubmit={petForm.handleSubmit(onAddPet)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={petForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter pet name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petForm.control}
                          name="species"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Species</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select species" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="dog">Dog</SelectItem>
                                  <SelectItem value="cat">Cat</SelectItem>
                                  <SelectItem value="rabbit">Rabbit</SelectItem>
                                  <SelectItem value="bird">Bird</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petForm.control}
                          name="breed"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Breed</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter breed" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petForm.control}
                          name="age"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Age (in months)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Enter age in months" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                For example, 24 months = 2 years
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petForm.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petForm.control}
                          name="size"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Size</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select size" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="small">Small</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="large">Large</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="available">Available</SelectItem>
                                  <SelectItem value="adopted">Adopted</SelectItem>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="fostered">Fostered</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter location" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter image URL" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={petForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter pet description" 
                                className="min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={petForm.control}
                        name="healthDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Health Details</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter health details" 
                                className="min-h-[80px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div>
                        <h3 className="text-sm font-medium mb-3">Good With</h3>
                        <div className="space-y-3">
                          <FormField
                            control={petForm.control}
                            name="goodWith.kids"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">Kids</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={petForm.control}
                            name="goodWith.dogs"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">Dogs</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={petForm.control}
                            name="goodWith.cats"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">Cats</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAddPetOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          className="bg-[#4A6FA5] hover:bg-[#3A5A87]"
                          disabled={createPetMutation.isPending}
                        >
                          {createPetMutation.isPending ? (
                            <Skeleton className="h-4 w-20" />
                          ) : (
                            'Add Pet'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              {/* Edit Pet Dialog */}
              <Dialog open={isEditPetOpen} onOpenChange={setIsEditPetOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Pet</DialogTitle>
                    <DialogDescription>
                      Update the pet's information.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...petForm}>
                    <form onSubmit={petForm.handleSubmit(onEditPet)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={petForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter pet name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petForm.control}
                          name="species"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Species</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select species" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="dog">Dog</SelectItem>
                                  <SelectItem value="cat">Cat</SelectItem>
                                  <SelectItem value="rabbit">Rabbit</SelectItem>
                                  <SelectItem value="bird">Bird</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petForm.control}
                          name="breed"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Breed</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter breed" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petForm.control}
                          name="age"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Age (in months)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Enter age in months" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                For example, 24 months = 2 years
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petForm.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petForm.control}
                          name="size"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Size</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select size" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="small">Small</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="large">Large</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="available">Available</SelectItem>
                                  <SelectItem value="adopted">Adopted</SelectItem>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="fostered">Fostered</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter location" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter image URL" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={petForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter pet description" 
                                className="min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={petForm.control}
                        name="healthDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Health Details</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter health details" 
                                className="min-h-[80px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div>
                        <h3 className="text-sm font-medium mb-3">Good With</h3>
                        <div className="space-y-3">
                          <FormField
                            control={petForm.control}
                            name="goodWith.kids"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">Kids</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={petForm.control}
                            name="goodWith.dogs"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">Dogs</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={petForm.control}
                            name="goodWith.cats"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">Cats</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsEditPetOpen(false);
                            setSelectedPet(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          className="bg-[#4A6FA5] hover:bg-[#3A5A87]"
                          disabled={updatePetMutation.isPending}
                        >
                          {updatePetMutation.isPending ? (
                            <Skeleton className="h-4 w-24" />
                          ) : (
                            'Update Pet'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              {/* Delete Pet Confirmation */}
              <AlertDialog open={isDeletePetOpen} onOpenChange={setIsDeletePetOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {selectedPet?.name}. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedPet(null)}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDeletePet}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {deletePetMutation.isPending ? (
                        <Skeleton className="h-4 w-20" />
                      ) : (
                        'Delete'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TabsContent>
            
            {/* Applications Management */}
            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>Adoption Applications</CardTitle>
                  <CardDescription>
                    Review and manage adoption applications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-6">
                    <Select
                      value={applicationFilter}
                      onValueChange={setApplicationFilter}
                    >
                      <SelectTrigger className="max-w-xs">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Applications</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {isApplicationsLoading ? (
                    <ListRowsSkeleton rows={4} />
                  ) : filteredApplications.length > 0 ? (
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Applicant</TableHead>
                            <TableHead>Pet</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredApplications.map((app) => (
                            <TableRow key={app.id}>
                              <TableCell className="font-medium">
                                {getUserName(app.userId)}
                              </TableCell>
                              <TableCell>{getPetName(app.petId)}</TableCell>
                              <TableCell>
                                {app.applicationDate
                                  ? format(new Date(app.applicationDate), "PPP")
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`${
                                    app.status === "approved"
                                      ? "bg-[#47B881]"
                                      : app.status === "rejected"
                                      ? "bg-red-500"
                                      : "bg-amber-500"
                                  }`}
                                >
                                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-[#4A6FA5] border-[#4A6FA5]"
                                      >
                                        View
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Application Details</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <h4 className="text-sm font-medium text-neutral-500">Applicant</h4>
                                            <p>{getUserName(app.userId)}</p>
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-medium text-neutral-500">Pet</h4>
                                            <p>{getPetName(app.petId)}</p>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium text-neutral-500">Application Date</h4>
                                          <p>
                                            {app.applicationDate
                                              ? format(new Date(app.applicationDate), "PPP")
                                              : "—"}
                                          </p>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium text-neutral-500">Status</h4>
                                          <Badge
                                            className={`${
                                              app.status === "approved"
                                                ? "bg-[#47B881]"
                                                : app.status === "rejected"
                                                ? "bg-red-500"
                                                : "bg-amber-500"
                                            } mt-1`}
                                          >
                                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                          </Badge>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium text-neutral-500">Notes</h4>
                                          <p className="text-sm">{app.notes || "No notes provided."}</p>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedApplication(app);
                                      setIsUpdateApplicationOpen(true);
                                    }}
                                  >
                                    Update Status
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-500">No applications found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Update Application Status Dialog */}
              <Dialog open={isUpdateApplicationOpen} onOpenChange={setIsUpdateApplicationOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Application Status</DialogTitle>
                    <DialogDescription>
                      Change the status of this adoption application.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...applicationForm}>
                    <form onSubmit={applicationForm.handleSubmit(onUpdateApplication)} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-neutral-500">Applicant</h4>
                          <p>{selectedApplication && getUserName(selectedApplication.userId)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-neutral-500">Pet</h4>
                          <p>{selectedApplication && getPetName(selectedApplication.petId)}</p>
                        </div>
                      </div>
                      
                      <FormField
                        control={applicationForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsUpdateApplicationOpen(false);
                            setSelectedApplication(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          className="bg-[#4A6FA5] hover:bg-[#3A5A87]"
                          disabled={updateApplicationMutation.isPending}
                        >
                          {updateApplicationMutation.isPending ? (
                            <Skeleton className="h-4 w-24" />
                          ) : (
                            'Update Status'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </TabsContent>
            
            {/* Resources Management */}
            <TabsContent value="resources">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle>Pet Care Resources</CardTitle>
                    <CardDescription>
                      Manage informational articles and resources.
                    </CardDescription>
                  </div>
                  <Button 
                    className="bg-[#47B881] hover:bg-[#3A9268]"
                    onClick={() => setIsAddResourceOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Resource
                  </Button>
                </CardHeader>
                <CardContent>
                  {isResourcesLoading ? (
                    <ListRowsSkeleton rows={4} />
                  ) : resources && resources.length > 0 ? (
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[300px]">Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Date Added</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {resources.map((resource) => (
                            <TableRow key={resource.id}>
                              <TableCell className="font-medium">{resource.title}</TableCell>
                              <TableCell>{resource.category}</TableCell>
                              <TableCell>
                                {resource.createdAt
                                  ? format(new Date(resource.createdAt), "PPP")
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedResource(resource);
                                      setIsEditResourceOpen(true);
                                    }}
                                    className="text-[#4A6FA5] border-[#4A6FA5]"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedResource(resource);
                                      setIsDeleteResourceOpen(true);
                                    }}
                                    className="text-red-500 border-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-500">No resources found. Add a resource to get started.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Add Resource Dialog */}
              <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Resource</DialogTitle>
                    <DialogDescription>
                      Create a new pet care resource or article.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...resourceForm}>
                    <form onSubmit={resourceForm.handleSubmit(onAddResource)} className="space-y-6">
                      <FormField
                        control={resourceForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter resource title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={resourceForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Getting Started">Getting Started</SelectItem>
                                <SelectItem value="Nutrition">Nutrition</SelectItem>
                                <SelectItem value="Training">Training</SelectItem>
                                <SelectItem value="Health">Health</SelectItem>
                                <SelectItem value="Behavior">Behavior</SelectItem>
                                <SelectItem value="Grooming">Grooming</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={resourceForm.control}
                        name="summary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Summary</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter a brief summary of the resource" 
                                className="min-h-[80px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={resourceForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter the full content of the resource" 
                                className="min-h-[200px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={resourceForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter image URL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAddResourceOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          className="bg-[#4A6FA5] hover:bg-[#3A5A87]"
                          disabled={createResourceMutation.isPending}
                        >
                          {createResourceMutation.isPending ? (
                            <Skeleton className="h-4 w-20" />
                          ) : (
                            'Add Resource'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              {/* Edit Resource Dialog */}
              <Dialog open={isEditResourceOpen} onOpenChange={setIsEditResourceOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Resource</DialogTitle>
                    <DialogDescription>
                      Update the resource information.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...resourceForm}>
                    <form onSubmit={resourceForm.handleSubmit(onEditResource)} className="space-y-6">
                      <FormField
                        control={resourceForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter resource title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={resourceForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Getting Started">Getting Started</SelectItem>
                                <SelectItem value="Nutrition">Nutrition</SelectItem>
                                <SelectItem value="Training">Training</SelectItem>
                                <SelectItem value="Health">Health</SelectItem>
                                <SelectItem value="Behavior">Behavior</SelectItem>
                                <SelectItem value="Grooming">Grooming</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={resourceForm.control}
                        name="summary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Summary</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter a brief summary of the resource" 
                                className="min-h-[80px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={resourceForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter the full content of the resource" 
                                className="min-h-[200px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={resourceForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter image URL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsEditResourceOpen(false);
                            setSelectedResource(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          className="bg-[#4A6FA5] hover:bg-[#3A5A87]"
                          disabled={updateResourceMutation.isPending}
                        >
                          {updateResourceMutation.isPending ? (
                            <Skeleton className="h-4 w-24" />
                          ) : (
                            'Update Resource'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              {/* Delete Resource Confirmation */}
              <AlertDialog open={isDeleteResourceOpen} onOpenChange={setIsDeleteResourceOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this resource. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedResource(null)}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDeleteResource}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {deleteResourceMutation.isPending ? (
                        <Skeleton className="h-4 w-20" />
                      ) : (
                        'Delete'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TabsContent>
            
            {/* Appointments Management */}
            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Management</CardTitle>
                  <CardDescription>
                    View and manage all scheduled appointments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-neutral-500 mb-2">This feature is coming soon.</p>
                    <p className="text-sm text-neutral-400">
                      Admin appointment management is under development. Check back later.
                    </p>
                  </div>
                  
                  {/* Appointment overview statistics placeholders */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-neutral-500">Total Appointments</p>
                            <p className="text-2xl font-bold">0</p>
                          </div>
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Calendar className="h-5 w-5 text-[#4A6FA5]" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-neutral-500">Scheduled</p>
                            <p className="text-2xl font-bold">0</p>
                          </div>
                          <div className="bg-amber-100 p-2 rounded-full">
                            <Clock className="h-5 w-5 text-amber-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-neutral-500">Completed</p>
                            <p className="text-2xl font-bold">0</p>
                          </div>
                          <div className="bg-green-100 p-2 rounded-full">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-neutral-500">Cancelled</p>
                            <p className="text-2xl font-bold">0</p>
                          </div>
                          <div className="bg-red-100 p-2 rounded-full">
                            <XCircle className="h-5 w-5 text-red-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
