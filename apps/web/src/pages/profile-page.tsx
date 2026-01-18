import { useMemo } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type {
  Appointment,
  AdoptionApplication,
  EmergencyContact,
  Pet,
  PetMedicalRecord,
} from "@pawpal/shared/schema";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Heart, PawPrint, ShieldAlert, FileText, ClipboardList } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: myPets = [] } = useQuery<Pet[]>({
    queryKey: ["/api/me/pets"],
    enabled: !!user,
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: !!user,
  });

  const { data: favorites = [] } = useQuery<Pet[]>({
    queryKey: ["/api/pets/favorites"],
    enabled: !!user,
  });

  const { data: adoptionApplications = [] } = useQuery<AdoptionApplication[]>({
    queryKey: ["/api/adoption-applications"],
    enabled: !!user,
  });

  const { data: emergencyContacts = [] } = useQuery<EmergencyContact[]>({
    queryKey: ["/api/emergency-contacts"],
    enabled: !!user,
  });

  const { data: medicalRecords = [] } = useQuery<PetMedicalRecord[]>({
    queryKey: ["/api/pet-medical-records"],
    enabled: !!user,
  });

  const petById = useMemo(() => new Map(myPets.map((p) => [p.id, p])), [myPets]);

  // ProtectedRoute already redirects if unauthenticated, but we must still return an element for typing.
  if (!user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-neutral-100 py-10">
          <div className="container mx-auto px-4">
            <div className="rounded-lg border bg-white p-6 text-neutral-600">Loading profile…</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Profile - PawPal</title>
        <meta name="description" content="Manage your PawPal profile, pets, favorites, applications, and appointments." />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-neutral-100 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-neutral-600 mt-1">
                Welcome, <span className="font-medium">{user.name}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/pets/register">
                <Button className="bg-[#4A6FA5] hover:bg-[#3A5A87]">
                  <PawPrint className="h-4 w-4 mr-2" />
                  Register / List a Pet
                </Button>
              </Link>
              <Link href="/appointments">
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </Link>
            </div>
          </div>

          <Tabs defaultValue="pets">
            <TabsList className="mb-6 flex flex-wrap">
              <TabsTrigger value="pets">
                My Pets
                <span className="ml-2 text-xs bg-[#4A6FA5] text-white rounded-full px-2 py-0.5">
                  {myPets.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="appointments">
                Appointments
                <span className="ml-2 text-xs bg-[#4A6FA5] text-white rounded-full px-2 py-0.5">
                  {appointments.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="favorites">
                Favorites
                <span className="ml-2 text-xs bg-[#4A6FA5] text-white rounded-full px-2 py-0.5">
                  {favorites.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="applications">
                Applications
                <span className="ml-2 text-xs bg-[#4A6FA5] text-white rounded-full px-2 py-0.5">
                  {adoptionApplications.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="emergency">
                Emergency
                <span className="ml-2 text-xs bg-[#4A6FA5] text-white rounded-full px-2 py-0.5">
                  {emergencyContacts.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="medical">
                Medical
                <span className="ml-2 text-xs bg-[#4A6FA5] text-white rounded-full px-2 py-0.5">
                  {medicalRecords.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pets">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PawPrint className="h-5 w-5 text-[#4A6FA5]" />
                    My Pet Listings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {myPets.length === 0 ? (
                    <div className="text-neutral-600">
                      You haven’t listed any pets yet.{" "}
                      <Link href="/pets/register" className="text-[#4A6FA5] underline">
                        Create your first listing
                      </Link>
                      .
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myPets.map((pet) => (
                        <Card key={pet.id} className="overflow-hidden">
                          <img src={pet.imageUrl} alt={pet.name} className="w-full h-44 object-cover" />
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="font-semibold text-lg">{pet.name}</div>
                                <div className="text-sm text-neutral-600">
                                  {pet.breed} • {pet.species}
                                </div>
                              </div>
                              <Badge className="bg-[#6B8DB9] text-white">{pet.status}</Badge>
                            </div>
                            <div className="mt-4">
                              <Link href={`/pets/${pet.id}`}>
                                <Button variant="outline" className="w-full">
                                  View Listing
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#4A6FA5]" />
                    My Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <div className="text-neutral-600">
                      No appointments yet.{" "}
                      <Link href="/appointments" className="text-[#4A6FA5] underline">
                        Book one now
                      </Link>
                      .
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Pet</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium">{a.type}</TableCell>
                            <TableCell>{format(new Date(a.date!), "PPP p")}</TableCell>
                            <TableCell>
                              {a.petId ? (
                                <Link href={`/pets/${a.petId}`} className="text-[#4A6FA5] underline">
                                  {petById.get(a.petId)?.name ?? `Pet #${a.petId}`}
                                </Link>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-[#6B8DB9] text-white">{a.status ?? "scheduled"}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-[#4A6FA5]" />
                    Favorite Pets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {favorites.length === 0 ? (
                    <div className="text-neutral-600">No favorites yet. Browse pets and tap the heart.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favorites.map((pet) => (
                        <Card key={pet.id} className="overflow-hidden">
                          <img src={pet.imageUrl} alt={pet.name} className="w-full h-44 object-cover" />
                          <CardContent className="pt-4">
                            <div className="font-semibold text-lg">{pet.name}</div>
                            <div className="text-sm text-neutral-600">
                              {pet.breed} • {pet.species}
                            </div>
                            <div className="mt-4">
                              <Link href={`/pets/${pet.id}`}>
                                <Button variant="outline" className="w-full">
                                  View Pet
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-[#4A6FA5]" />
                    Adoption Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {adoptionApplications.length === 0 ? (
                    <div className="text-neutral-600">No applications yet.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pet</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adoptionApplications.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell>
                              <Link href={`/pets/${a.petId}`} className="text-[#4A6FA5] underline">
                                Pet #{a.petId}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-[#6B8DB9] text-white">{a.status ?? "pending"}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[520px] truncate">{a.notes ?? "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="emergency">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-[#4A6FA5]" />
                    Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Link href="/emergency">
                      <Button variant="outline">
                        <ShieldAlert className="h-4 w-4 mr-2" />
                        Manage in Emergency Page
                      </Button>
                    </Link>
                  </div>

                  {emergencyContacts.length === 0 ? (
                    <div className="text-neutral-600">No emergency contacts saved yet.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emergencyContacts.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.contactName}</TableCell>
                            <TableCell>{c.phone}</TableCell>
                            <TableCell className="max-w-[520px] truncate">{c.address}</TableCell>
                            <TableCell>{c.isVet ? "Vet" : "Other"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#4A6FA5]" />
                    Pet Medical Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Link href="/emergency">
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Add / Manage Records
                      </Button>
                    </Link>
                  </div>

                  {medicalRecords.length === 0 ? (
                    <div className="text-neutral-600">No medical records saved yet.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pet</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {medicalRecords.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>
                              <Link href={`/pets/${r.petId}`} className="text-[#4A6FA5] underline">
                                {petById.get(r.petId)?.name ?? `Pet #${r.petId}`}
                              </Link>
                            </TableCell>
                            <TableCell className="font-medium">{r.recordType}</TableCell>
                            <TableCell>{format(new Date(r.recordDate!), "PPP")}</TableCell>
                            <TableCell className="max-w-[520px] truncate">{r.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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

