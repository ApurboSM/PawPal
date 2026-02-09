import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import type { Pet, PetMedicalRecord } from "@pawpal/shared/schema";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Calendar, MapPin, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailSkeleton } from "@/components/skeletons/page-skeletons";
import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

export default function PetDetailPage() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Adoption application dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch pet details
  const { 
    data: pet, 
    isLoading, 
    isError 
  } = useQuery<Pet>({
    queryKey: [`/api/pets/${id}`],
    enabled: !!id,
  });

  const { data: medicalRecords } = useQuery<PetMedicalRecord[]>({
    queryKey: [`/api/pets/${id}/medical-records`],
    enabled: !!id,
  });

  const isFavorited = useMemo(() => {
    const petId = pet?.id;
    const favs = (user as any)?.favorites as number[] | undefined;
    if (!petId || !Array.isArray(favs)) return false;
    return favs.includes(petId);
  }, [pet?.id, user]);
  
  // Adoption application form
  const form = useForm({
    defaultValues: {
      notes: "",
    },
  });
  
  // Adoption application mutation
  const applicationMutation = useMutation({
    mutationFn: async (data: { petId: number; notes: string }) => {
      const response = await apiRequest("POST", "/api/adoption-applications", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your adoption application has been successfully submitted. We'll be in touch soon!",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Application Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async (nextFavorited: boolean) => {
      const response = await apiRequest("POST", `/api/pets/${pet!.id}/favorite`, {
        favorited: nextFavorited,
      });
      return response.json() as Promise<{ favorites: number[] }>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], (prev: any) => {
        if (!prev) return prev;
        return { ...prev, favorites: data.favorites };
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pets/favorites"] });
    },
  });
  
  // Handle application submission
  const onSubmitApplication = (data: { notes: string }) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to submit an adoption application.",
        variant: "destructive",
      });
      setIsDialogOpen(false);
      setLocation("/auth");
      return;
    }
    
    if (!pet) return;
    
    applicationMutation.mutate({
      petId: pet.id,
      notes: data.notes,
    });
  };
  
  // Handle favorite toggle
  const handleFavorite = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to favorite pets.",
        variant: "destructive"
      });
      return;
    }

    if (!pet) return;
    const next = !isFavorited;
    favoriteMutation.mutate(next);
    toast({
      title: next ? "Added to favorites" : "Removed from favorites",
      description: next
        ? `${pet.name} has been added to your favorites.`
        : `${pet.name} has been removed from your favorites.`,
    });
  };
  
  // Helper function to format pet age
  const formatAge = (ageInMonths: number) => {
    if (ageInMonths < 12) {
      return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      if (months === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
      }
      return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
    }
  };
  
  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-neutral-100">
          <DetailSkeleton />
        </main>
        <Footer />
      </>
    );
  }
  
  if (isError || !pet) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-neutral-100 py-12">
          <div className="container mx-auto px-4 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Pet Not Found</h1>
            <p className="text-lg text-neutral-600 mb-8">
              We couldn't find the pet you're looking for. It may have been adopted or removed.
            </p>
            <Button 
              onClick={() => setLocation("/pets")}
              className="bg-[#4A6FA5] hover:bg-[#3A5A87]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Pets
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{`${pet.name} - ${pet.breed} - PawPal Adoption`}</title>
        <meta name="description" content={`Meet ${pet.name}, a ${formatAge(pet.age)} old ${pet.breed} looking for a loving home. ${pet.description.substring(0, 120)}...`} />
      </Helmet>
      
      <Navbar />
      
      <main className="bg-neutral-100 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button 
              variant="ghost"
              onClick={() => setLocation("/pets")}
              className="text-[#4A6FA5] mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Pets
            </Button>
            
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl md:text-4xl font-bold">{pet.name}</h1>
              <Badge 
                className="bg-[#6B8DB9] hover:bg-[#4A6FA5] text-white"
              >
                {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
              </Badge>
              {pet.status === "available" && (
                <Badge 
                  className="bg-[#47B881] hover:bg-[#3A9268] text-white"
                >
                  Available for Adoption
                </Badge>
              )}
            </div>
            <p className="text-neutral-600 mt-1">{pet.breed}</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pet Image */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden mb-8">
                <img 
                  src={pet.imageUrl} 
                  alt={`${pet.name} - ${pet.breed}`} 
                  className="w-full h-[400px] object-cover"
                />
              </Card>
              
              {/* Pet Description */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>About {pet.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-700 whitespace-pre-line">
                    {pet.description}
                  </p>
                  
                  <Separator className="my-6" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Good With</h3>
                      <ul className="space-y-1">
                        <li className="flex items-center">
                          {pet.goodWith.kids ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          Children
                        </li>
                        <li className="flex items-center">
                          {pet.goodWith.dogs ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          Dogs
                        </li>
                        <li className="flex items-center">
                          {pet.goodWith.cats ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          Cats
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Health Details</h3>
                      <p className="text-neutral-700">{pet.healthDetails}</p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="font-semibold mb-2">Medical History</h3>
                    {medicalRecords && medicalRecords.length > 0 ? (
                      <div className="space-y-3">
                        {medicalRecords.map((r) => (
                          <div key={r.id} className="rounded-lg border bg-white p-3">
                            <div className="flex items-center justify-between">
                              <div className="font-medium capitalize">{r.recordType.replaceAll("_", " ")}</div>
                              <div className="text-sm text-neutral-500">
                                {new Date(r.recordDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-sm text-neutral-700 mt-1">{r.description}</div>
                            {(r.vetName || r.notes) && (
                              <div className="text-xs text-neutral-500 mt-1">
                                {r.vetName ? `Vet: ${r.vetName}` : null}
                                {r.vetName && r.notes ? " · " : null}
                                {r.notes ? `Notes: ${r.notes}` : null}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-600">No medical records available.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Quick Info Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Age</span>
                    <span className="font-medium">{formatAge(pet.age)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Gender</span>
                    <span className="font-medium capitalize">{pet.gender}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Size</span>
                    <span className="font-medium capitalize">{pet.size}</span>
                  </div>
                  <Separator />
                  <div className="flex items-start justify-between">
                    <span className="text-neutral-600">Location</span>
                    <span className="font-medium text-right flex items-center">
                      <MapPin className="h-4 w-4 mr-1 inline" />
                      {pet.location}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Action Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Interested in {pet.name}?</CardTitle>
                  <CardDescription>
                    Take the next step in your adoption journey.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-[#4A6FA5] hover:bg-[#3A5A87]"
                        size="lg"
                      >
                        Apply to Adopt
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adoption Application</DialogTitle>
                        <DialogDescription>
                          Please provide additional information about why you want to adopt {pet.name}.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitApplication)}>
                          <div className="py-4">
                            <FormField
                              control={form.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Textarea
                                      placeholder={`Tell us why you're interested in adopting ${pet.name} and a bit about your home environment.`}
                                      className="min-h-[150px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <DialogFooter>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit"
                              className="bg-[#4A6FA5] hover:bg-[#3A5A87]"
                              disabled={applicationMutation.isPending}
                            >
                                {applicationMutation.isPending ? (
                                  <Skeleton className="h-4 w-28" />
                                ) : (
                                  "Submit Application"
                                )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  
                  <Link href="/appointments">
                    <Button 
                      variant="outline" 
                      className="w-full border-[#4A6FA5] text-[#4A6FA5] hover:bg-[#4A6FA5] hover:text-white"
                      size="lg"
                    >
                      <Calendar className="mr-2 h-4 w-4" /> 
                      Schedule a Visit
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="ghost" 
                    className={`w-full flex items-center justify-center ${
                      isFavorited ? 'text-[#E57A53]' : 'text-[#FF9166]'
                    }`}
                    onClick={handleFavorite}
                  >
                    <Heart className={`mr-2 h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                    {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Button>
                </CardContent>
                <CardFooter className="text-sm text-neutral-500 bg-neutral-50 rounded-b-lg p-4">
                  <p>
                    Questions about {pet.name}? Contact us at <span className="text-[#4A6FA5]">info@pawpal.com</span> or call <span className="text-[#4A6FA5]">(123) 456-7890</span>.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}

// Helper component for Link
function Link({ href, children }: { href: string; children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setLocation(href);
  };
  
  return (
    <a href={href} onClick={handleClick}>
      {children}
    </a>
  );
}
