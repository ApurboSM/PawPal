import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Appointment, AdoptionApplication, Pet } from "@pawpal/shared/schema";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProfileSkeleton } from "@/components/skeletons/page-skeletons";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, invalidatePetsQueries, queryClient } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { format } from "date-fns";
import { Calendar, MapPin, Phone, User, PawPrint, Pencil, Trash2, Settings } from "lucide-react";

type EditPetDraft = Pick<
  Pet,
  "id" | "name" | "species" | "breed" | "age" | "gender" | "size" | "description" | "location" | "healthDetails" | "status" | "imageUrl"
>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editPet, setEditPet] = useState<EditPetDraft | null>(null);
  const [editPetImageFile, setEditPetImageFile] = useState<File | null>(null);
  const [editPetImagePreview, setEditPetImagePreview] = useState<string>("");
  const [profileDraft, setProfileDraft] = useState<{ name: string; phone: string; location: string }>({
    name: "",
    phone: "",
    location: "",
  });

  const { data: myPets = [] } = useQuery<Pet[]>({
    queryKey: ["/api/me/pets"],
    enabled: !!user,
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: !!user,
  });

  const { data: adoptionApplications = [] } = useQuery<AdoptionApplication[]>({
    queryKey: ["/api/adoption-applications"],
    enabled: !!user,
  });

  const petById = useMemo(() => new Map(myPets.map((p) => [p.id, p])), [myPets]);
  const appointmentHistory = useMemo(
    () =>
      [...appointments].sort(
        (a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime(),
      ),
    [appointments],
  );

  const adoptedApps = useMemo(
    () => adoptionApplications.filter((a) => (a.status ?? "pending") === "approved"),
    [adoptionApplications],
  );

  const sellHistoryPets = useMemo(
    () => myPets.filter((p) => ["adopted", "pending"].includes(p.status ?? "available")),
    [myPets],
  );

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string; location: string }) => {
      const res = await apiRequest("PATCH", "/api/user", {
        name: data.name,
        phone: data.phone?.trim() ? data.phone.trim() : null,
        location: data.location?.trim() ? data.location.trim() : null,
      });
      return res.json();
    },
    onSuccess: (nextUser) => {
      queryClient.setQueryData(["/api/user"], nextUser);
      toast({ title: "Profile updated", description: "Your profile details were saved." });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (!user) return;
    setProfileDraft({
      name: user.name ?? "",
      phone: ((user as any).phone ?? "") as string,
      location: ((user as any).location ?? "") as string,
    });
  }, [user?.id]);

  const deletePetMutation = useMutation({
    mutationFn: async (petId: number) => {
      await apiRequest("DELETE", `/api/pets/${petId}`);
    },
    onSuccess: () => {
      toast({ title: "Pet deleted", description: "Your listing has been removed." });
      queryClient.invalidateQueries({ queryKey: ["/api/me/pets"] });
      invalidatePetsQueries(queryClient);
    },
    onError: (error: Error) => {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    },
  });

  const updatePetMutation = useMutation({
    mutationFn: async (draft: EditPetDraft) => {
      let imageUrl = draft.imageUrl;
      if (editPetImageFile) {
        const fd = new FormData();
        fd.append("file", editPetImageFile);
        const uploadRes = await fetch("/api/uploads/pet-image", {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        if (!uploadRes.ok) {
          const text = await uploadRes.text();
          throw new Error(text || "Failed to upload image");
        }
        const uploaded = (await uploadRes.json()) as { url: string };
        imageUrl = uploaded.url;
      }

      const res = await apiRequest("PUT", `/api/pets/${draft.id}`, {
        ...draft,
        imageUrl,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Pet updated", description: "Your listing changes were saved." });
      setEditPet(null);
      setEditPetImageFile(null);
      setEditPetImagePreview("");
      queryClient.invalidateQueries({ queryKey: ["/api/me/pets"] });
      invalidatePetsQueries(queryClient);
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  // ProtectedRoute already redirects if unauthenticated, but we must still return an element for typing.
  if (!user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-neutral-100 py-10">
          <ProfileSkeleton />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Profile - PawPal</title>
        <meta name="description" content="Manage your PawPal profile, pets, and history." />
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
                  Register / List your pets
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

          <Tabs defaultValue="my-profile">
            <TabsList className="mb-6 flex flex-wrap">
              <TabsTrigger value="my-profile">My Profile</TabsTrigger>
              <TabsTrigger value="my-pets">
                My Pets
                <span className="ml-2 text-xs bg-[#4A6FA5] text-white rounded-full px-2 py-0.5">
                  {myPets.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="appointment-history">
                Appointment History
                <span className="ml-2 text-xs bg-[#4A6FA5] text-white rounded-full px-2 py-0.5">
                  {appointmentHistory.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="adopt-sell">Adopt / Sell</TabsTrigger>
            </TabsList>

            <TabsContent value="my-profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-[#4A6FA5]" />
                    My Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border bg-white p-4">
                      <div className="text-sm text-neutral-500">Name</div>
                      <div className="font-medium">{user.name}</div>
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                      <div className="text-sm text-neutral-500">Email</div>
                      <div className="font-medium">{user.email}</div>
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                      <div className="text-sm text-neutral-500">Username</div>
                      <div className="font-medium">{user.username}</div>
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                      <div className="text-sm text-neutral-500">Member since</div>
                      <div className="font-medium">{(user as any).createdAt ? format(new Date((user as any).createdAt), "PPP") : "—"}</div>
                    </div>
                    <div className="rounded-lg border bg-white p-4 flex items-start gap-3">
                      <Phone className="h-5 w-5 text-neutral-600 mt-0.5" />
                      <div>
                        <div className="text-sm text-neutral-500">Phone</div>
                        <div className="font-medium">{(user as any).phone ?? "—"}</div>
                      </div>
                    </div>
                    <div className="rounded-lg border bg-white p-4 flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-neutral-600 mt-0.5" />
                      <div>
                        <div className="text-sm text-neutral-500">Location</div>
                        <div className="font-medium">{(user as any).location ?? "—"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-white p-4">
                    <div className="text-sm font-medium mb-3">Edit Profile</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-1">Name</div>
                        <Input
                          value={profileDraft.name}
                          onChange={(e) => setProfileDraft((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Phone</div>
                        <Input
                          value={profileDraft.phone}
                          onChange={(e) => setProfileDraft((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="+1 555..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-sm font-medium mb-1">Location</div>
                        <Input
                          value={profileDraft.location}
                          onChange={(e) => setProfileDraft((p) => ({ ...p, location: e.target.value }))}
                          placeholder="City, Country"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button
                        className="bg-[#4A6FA5] hover:bg-[#3A5A87]"
                        disabled={updateProfileMutation.isPending}
                        onClick={() => updateProfileMutation.mutate(profileDraft)}
                      >
                        Save Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-[#4A6FA5]" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      className="bg-[#4A6FA5] hover:bg-[#3A5A87]"
                      disabled={updateProfileMutation.isPending}
                      onClick={() => {
                        updateProfileMutation.mutate(profileDraft);
                      }}
                    >
                      Save Settings
                    </Button>
                    <div className="text-sm text-neutral-600">
                      Use the <span className="font-medium">My Profile</span> tab to edit your profile details.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-pets">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PawPrint className="h-5 w-5 text-[#4A6FA5]" />
                    My Pets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {myPets.length === 0 ? (
                    <div className="text-neutral-600">
                      You haven’t listed any pets yet.{" "}
                      <Link href="/pets/register" className="text-[#4A6FA5] underline">
                        Register / List your pets
                      </Link>
                      .
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pet</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myPets.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded object-cover" />
                                <div>
                                  <Link href={`/pets/${p.id}`} className="font-medium text-[#4A6FA5] underline">
                                    {p.name}
                                  </Link>
                                  <div className="text-xs text-neutral-600">{p.breed}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-[#6B8DB9] text-white">{p.status}</Badge>
                            </TableCell>
                            <TableCell>{p.location}</TableCell>
                            <TableCell className="text-right">
                              <div className="inline-flex gap-2">
                                <Dialog
                                  open={!!editPet && editPet.id === p.id}
                                  onOpenChange={(open) => {
                                    if (!open) {
                                      setEditPet(null);
                                      setEditPetImageFile(null);
                                      setEditPetImagePreview("");
                                    }
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditPet({
                                          id: p.id,
                                          name: p.name,
                                          species: p.species,
                                          breed: p.breed,
                                          age: p.age,
                                          gender: p.gender,
                                          size: p.size,
                                          description: p.description,
                                          location: p.location,
                                          healthDetails: p.healthDetails,
                                          status: p.status,
                                          imageUrl: p.imageUrl,
                                        });
                                      }}
                                    >
                                      <Pencil className="h-4 w-4 mr-1" />
                                      Edit
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Edit Pet</DialogTitle>
                                      <DialogDescription>Update your listing details.</DialogDescription>
                                    </DialogHeader>
                                    {editPet ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                                        <div className="space-y-2">
                                          <div className="text-sm font-medium">Name</div>
                                          <Input value={editPet.name} onChange={(e) => setEditPet({ ...editPet, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                          <div className="text-sm font-medium">Status</div>
                                          <Input value={editPet.status ?? "available"} onChange={(e) => setEditPet({ ...editPet, status: e.target.value as any })} />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                          <div className="text-sm font-medium">Location</div>
                                          <Input value={editPet.location} onChange={(e) => setEditPet({ ...editPet, location: e.target.value })} />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                          <div className="text-sm font-medium">Description</div>
                                          <Textarea value={editPet.description} onChange={(e) => setEditPet({ ...editPet, description: e.target.value })} />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                          <div className="text-sm font-medium">Pet Image</div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) => {
                                                const f = e.target.files?.[0] ?? null;
                                                setEditPetImageFile(f);
                                                if (f) setEditPetImagePreview(URL.createObjectURL(f));
                                                else setEditPetImagePreview("");
                                              }}
                                            />
                                            <div className="rounded-lg border bg-white overflow-hidden min-h-[120px] flex items-center justify-center">
                                              <img
                                                src={editPetImagePreview || editPet.imageUrl}
                                                alt="Preview"
                                                className="w-full h-32 object-cover"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ) : null}
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setEditPet(null);
                                          setEditPetImageFile(null);
                                          setEditPetImagePreview("");
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        className="bg-[#4A6FA5] hover:bg-[#3A5A87]"
                                        disabled={!editPet || updatePetMutation.isPending}
                                        onClick={() => editPet && updatePetMutation.mutate(editPet)}
                                      >
                                        Save Changes
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete this pet listing?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deletePetMutation.mutate(p.id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointment-history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#4A6FA5]" />
                    Appointment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointmentHistory.length === 0 ? (
                    <div className="text-neutral-600">No appointments yet.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Pet</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointmentHistory.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium">#{a.id}</TableCell>
                            <TableCell>{a.type}</TableCell>
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="adopt-sell">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Adoption History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {adoptedApps.length === 0 ? (
                      <div className="text-neutral-600">No approved adoptions yet.</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Application</TableHead>
                            <TableHead>Pet</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adoptedApps.map((a) => (
                            <TableRow key={a.id}>
                              <TableCell className="font-medium">#{a.id}</TableCell>
                              <TableCell>
                                <Link href={`/pets/${a.petId}`} className="text-[#4A6FA5] underline">
                                  Pet #{a.petId}
                                </Link>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-[#6B8DB9] text-white">{a.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sell / Listing History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sellHistoryPets.length === 0 ? (
                      <div className="text-neutral-600">No adopted/pending listings yet.</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pet</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sellHistoryPets.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell>
                                <Link href={`/pets/${p.id}`} className="text-[#4A6FA5] underline">
                                  {p.name}
                                </Link>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-[#6B8DB9] text-white">{p.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </>
  );
}

