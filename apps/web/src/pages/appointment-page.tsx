import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Appointment, Pet } from "@pawpal/shared/schema";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
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
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Info, 
  CheckCircle2, 
  XCircle, 
  ClipboardList 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ListRowsSkeleton } from "@/components/skeletons/page-skeletons";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, addDays, isBefore, startOfDay } from "date-fns";

// Form schema for appointment booking
const appointmentSchema = z.object({
  petId: z.number().nullable(),
  type: z.string({
    required_error: "Please select an appointment type",
  }),
  date: z.date({
    required_error: "Please select a date",
  }),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export default function AppointmentPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Fetch user's appointments
  const { 
    data: appointments, 
    isLoading: isAppointmentsLoading,
    refetch: refetchAppointments
  } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });
  
  // Fetch available pets
  const { 
    data: pets, 
    isLoading: isPetsLoading 
  } = useQuery<Pet[]>({
    queryKey: ["/api/pets?status=available"],
  });
  
  // Initialize form
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      petId: null,
      type: "",
      date: undefined,
      notes: "",
    },
  });
  
  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      const response = await apiRequest("POST", "/api/appointments", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Appointment Scheduled",
        description: "Your appointment has been successfully scheduled.",
      });
      form.reset();
      refetchAppointments();
    },
    onError: (error) => {
      toast({
        title: "Failed to Schedule Appointment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/appointments/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled.",
      });
      setSelectedAppointment(null);
      setDeleteDialogOpen(false);
      refetchAppointments();
    },
    onError: (error) => {
      toast({
        title: "Failed to Cancel Appointment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: AppointmentFormValues) => {
    createAppointmentMutation.mutate(data);
  };
  
  // Handle appointment deletion
  const handleDeleteAppointment = () => {
    if (selectedAppointment) {
      deleteAppointmentMutation.mutate(selectedAppointment.id);
    }
  };
  
  // Format appointment date
  const formatAppointmentDate = (date: Date) => {
    return format(new Date(date), "PPP 'at' p");
  };
  
  // Get pet name by ID
  const getPetName = (petId: number | null) => {
    if (!petId || !pets) return "N/A";
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.name : "N/A";
  };
  
  return (
    <>
      <Helmet>
        <title>Book an Appointment - PawPal</title>
        <meta name="description" content="Schedule a visit or veterinary appointment for your pet. Book meet & greets, vet check-ups, or grooming services at PawPal." />
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen bg-neutral-100 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Appointments</h1>
          <p className="text-lg text-neutral-600 mb-8">
            Schedule a visit or veterinary service for your pets.
          </p>
          
          <Tabs defaultValue="book">
            <TabsList className="mb-8">
              <TabsTrigger value="book">Book Appointment</TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming Appointments
                {appointments && appointments.length > 0 && (
                  <span className="ml-2 bg-[#4A6FA5] text-white text-xs rounded-full px-2 py-0.5">
                    {appointments.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="book">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Appointment Booking Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Book an Appointment</CardTitle>
                    <CardDescription>
                      Fill out the form below to schedule your appointment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Appointment Type */}
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Appointment Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select appointment type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="meet_and_greet">Meet & Greet</SelectItem>
                                  <SelectItem value="veterinary_care">Veterinary Care</SelectItem>
                                  <SelectItem value="grooming">Grooming Services</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Pet Selection */}
                        <FormField
                          control={form.control}
                          name="petId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Pet (Optional for Meet & Greets)
                              </FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} 
                                defaultValue={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a pet" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">None (For Meet & Greet)</SelectItem>
                                  {isPetsLoading ? (
                                    <SelectItem value="loading" disabled>
                                      <div className="w-full">
                                        <Skeleton className="h-4 w-24" />
                                      </div>
                                    </SelectItem>
                                  ) : pets && pets.length > 0 ? (
                                    pets.map(pet => (
                                      <SelectItem key={pet.id} value={pet.id.toString()}>
                                        {pet.name} ({pet.breed})
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-pets" disabled>
                                      No pets available
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Date Selection */}
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Appointment Date</FormLabel>
                              <div className="border rounded-md p-4">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => 
                                    isBefore(date, startOfDay(new Date())) || 
                                    date.getDay() === 0 // Disable Sundays
                                  }
                                  initialFocus
                                />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Additional Notes */}
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Please include any specific concerns or questions you have for your appointment."
                                  className="resize-none min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit"
                          className="w-full bg-[#4A6FA5] hover:bg-[#3A5A87]"
                          disabled={createAppointmentMutation.isPending}
                        >
                          {createAppointmentMutation.isPending ? (
                            <Skeleton className="h-4 w-20" />
                          ) : (
                            'Schedule Appointment'
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                {/* Appointment Information */}
                <div className="space-y-6">
                  {/* Service Types */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Our Services</CardTitle>
                      <CardDescription>
                        Learn more about the different appointment types we offer.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold flex items-center text-[#4A6FA5]">
                          <span className="bg-[#4A6FA5] text-white p-1 rounded-full mr-2">
                            <CalendarIcon className="h-4 w-4" />
                          </span>
                          Meet & Greet
                        </h3>
                        <p className="text-neutral-600 pl-8">
                          Schedule a time to meet and interact with a pet you're interested in adopting. Our staff will be available to answer any questions about the pet's personality and needs.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold flex items-center text-[#4A6FA5]">
                          <span className="bg-[#4A6FA5] text-white p-1 rounded-full mr-2">
                            <Stethoscope className="h-4 w-4" />
                          </span>
                          Veterinary Care
                        </h3>
                        <p className="text-neutral-600 pl-8">
                          Book routine check-ups, vaccinations, or other medical services for your pets. Our experienced veterinarians provide comprehensive care for all kinds of pets.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold flex items-center text-[#4A6FA5]">
                          <span className="bg-[#4A6FA5] text-white p-1 rounded-full mr-2">
                            <Scissors className="h-4 w-4" />
                          </span>
                          Grooming Services
                        </h3>
                        <p className="text-neutral-600 pl-8">
                          Schedule grooming appointments to keep your pets clean and comfortable. Our professional groomers offer baths, haircuts, nail trims, and more.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* FAQ */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-1">How long do appointments typically last?</h3>
                        <p className="text-neutral-600 text-sm">
                          Meet & Greets typically last 30-45 minutes, veterinary appointments 30 minutes, and grooming services vary based on the pet and services needed.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-1">What should I bring to my appointment?</h3>
                        <p className="text-neutral-600 text-sm">
                          For veterinary or grooming appointments, bring your pet's medical records if available. For meet & greets, bring any family members who will be part of the adoption decision.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-1">Can I reschedule my appointment?</h3>
                        <p className="text-neutral-600 text-sm">
                          Yes, you can reschedule by cancelling your current appointment and booking a new one. Please try to give at least 24 hours notice.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle>Your Upcoming Appointments</CardTitle>
                  <CardDescription>
                    View and manage your scheduled appointments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isAppointmentsLoading ? (
                    <ListRowsSkeleton rows={4} />
                  ) : appointments && appointments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Pet</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map(appointment => (
                          <TableRow key={appointment.id}>
                            <TableCell className="font-medium">
                              {appointment.type === "meet_and_greet" ? (
                                "Meet & Greet"
                              ) : appointment.type === "veterinary_care" ? (
                                "Veterinary Care"
                              ) : (
                                "Grooming Services"
                              )}
                            </TableCell>
                            <TableCell>{getPetName(appointment.petId)}</TableCell>
                            <TableCell>{formatAppointmentDate(appointment.date)}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {appointment.status === "scheduled" ? (
                                  <span className="flex items-center text-amber-600">
                                    <Clock className="h-4 w-4 mr-1" />
                                    Scheduled
                                  </span>
                                ) : appointment.status === "completed" ? (
                                  <span className="flex items-center text-green-600">
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Completed
                                  </span>
                                ) : (
                                  <span className="flex items-center text-red-600">
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Cancelled
                                  </span>
                                )}
                              </div>
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
                                      <Info className="h-4 w-4 mr-1" />
                                      Details
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Appointment Details</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="grid grid-cols-3 gap-4">
                                        <div>
                                          <h4 className="text-sm font-medium text-neutral-500">Type</h4>
                                          <p>
                                            {appointment.type === "meet_and_greet" ? (
                                              "Meet & Greet"
                                            ) : appointment.type === "veterinary_care" ? (
                                              "Veterinary Care"
                                            ) : (
                                              "Grooming Services"
                                            )}
                                          </p>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium text-neutral-500">Pet</h4>
                                          <p>{getPetName(appointment.petId)}</p>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium text-neutral-500">Status</h4>
                                          <p className="capitalize">{appointment.status}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium text-neutral-500">Date & Time</h4>
                                        <p>{formatAppointmentDate(appointment.date)}</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium text-neutral-500">Notes</h4>
                                        <p className="text-sm">{appointment.notes || "No additional notes provided."}</p>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => {}}>
                                        Close
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                
                                {appointment.status === "scheduled" && (
                                  <AlertDialog
                                    open={deleteDialogOpen && selectedAppointment?.id === appointment.id}
                                    onOpenChange={(open) => {
                                      if (!open) setSelectedAppointment(null);
                                      setDeleteDialogOpen(open);
                                    }}
                                  >
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={() => setSelectedAppointment(appointment)}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Cancel
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will cancel your scheduled appointment. This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>No, keep it</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={handleDeleteAppointment}
                                          className="bg-red-500 hover:bg-red-600"
                                        >
                                          {deleteAppointmentMutation.isPending ? (
                                            <Skeleton className="h-4 w-24" />
                                          ) : (
                                            "Yes, cancel appointment"
                                          )}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <ClipboardList className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Appointments</h3>
                      <p className="text-neutral-600 mb-6">
                        You don't have any upcoming appointments scheduled.
                      </p>
                      <Button
                        onClick={() => {
                          const element = document.querySelector('[data-value="book"]') as HTMLElement;
                          if (element) element.click();
                        }}
                        className="bg-[#4A6FA5] hover:bg-[#3A5A87]"
                      >
                        Book an Appointment
                      </Button>
                    </div>
                  )}
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

// Custom scissors icon
function Scissors({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4 8.12 15.88" />
      <path d="M14.47 14.48 20 20" />
      <path d="M8.12 8.12 12 12" />
    </svg>
  );
}

// Custom stethoscope icon
function Stethoscope({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4.5 12.5V6a2.5 2.5 0 0 1 5 0v6.5a5.5 5.5 0 0 0 11 0V9a3 3 0 0 0-3-3h-.5" />
      <circle cx="7" cy="12" r="1" />
      <path d="M7 19v-.5a5.5 5.5 0 0 1 5.5-5.5" />
    </svg>
  );
}
