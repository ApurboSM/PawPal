import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const medicalRecordSchema = z.object({
  recordType: z.string().min(1, "Record type is required"),
  recordDate: z.string().min(1, "Record date is required"),
  description: z.string().min(1, "Description is required"),
  vetName: z.string().optional(),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

const petListingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().min(1, "Breed is required"),
  age: z.coerce.number().int().min(0, "Age (months) must be 0 or greater"),
  gender: z.string().min(1, "Gender is required"),
  size: z.string().min(1, "Size is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Image URL must be a valid URL").optional().or(z.literal("")),
  location: z.string().min(1, "Location is required"),
  healthDetails: z.string().min(1, "Health details are required"),
  goodWith: z.object({
    kids: z.boolean().optional(),
    dogs: z.boolean().optional(),
    cats: z.boolean().optional(),
  }),
  medicalRecords: z.array(medicalRecordSchema).optional(),
});

type PetListingForm = z.infer<typeof petListingSchema>;

export default function PetRegisterPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");

  const form = useForm<PetListingForm>({
    resolver: zodResolver(petListingSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      age: 0,
      gender: "",
      size: "",
      description: "",
      imageUrl: "",
      location: "",
      healthDetails: "",
      goodWith: { kids: false, dogs: false, cats: false },
      medicalRecords: [],
    },
  });

  const medicalRecords = useFieldArray({
    control: form.control,
    name: "medicalRecords",
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: PetListingForm) => {
      let imageUrl = data.imageUrl?.trim() ?? "";
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
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

      if (!imageUrl) {
        throw new Error("Please upload a pet image.");
      }

      const payload = {
        ...data,
        imageUrl,
        medicalRecords: (data.medicalRecords ?? []).map((r) => ({
          ...r,
          // backend coerces; sending ISO string keeps it JSON-safe
          recordDate: new Date(r.recordDate).toISOString(),
        })),
      };
      const res = await apiRequest("POST", "/api/pets/listings", payload);
      return res.json();
    },
    onSuccess: (pet: { id: number }) => {
      toast({
        title: "Pet listed successfully",
        description: "Your pet listing is now live.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/me/pets"] });
      setLocation(`/profile`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create listing",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PetListingForm) => {
    createListingMutation.mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>Register / List a Pet - PawPal</title>
        <meta name="description" content="List your pet for adoption or sale, including medical records and care details." />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-neutral-100 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Register / List your pets</CardTitle>
              <CardDescription>
                Fill out details about your pet. You can also add medical history so it appears publicly on the pet profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Milo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="species"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Species</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                              <SelectItem value="guinea_pig">Guinea Pig</SelectItem>
                              <SelectItem value="fish">Fish</SelectItem>
                              <SelectItem value="parrot">Parrot</SelectItem>
                              <SelectItem value="hamster">Hamster</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="breed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Breed</FormLabel>
                          <FormControl>
                            <Input placeholder="Golden Retriever" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age (months)</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} placeholder="18" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="New York, NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <div className="font-medium">Pet Image</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0] ?? null;
                            setImageFile(f);
                            if (f) {
                              const url = URL.createObjectURL(f);
                              setImagePreviewUrl(url);
                            } else {
                              setImagePreviewUrl("");
                            }
                          }}
                        />
                        <p className="text-xs text-muted-foreground">
                          Upload a clear photo. Max 5MB.
                        </p>
                      </div>
                      <div className="rounded-lg border bg-white overflow-hidden min-h-[160px] flex items-center justify-center">
                        {imagePreviewUrl ? (
                          <img src={imagePreviewUrl} alt="Preview" className="w-full h-40 object-cover" />
                        ) : (
                          <div className="text-sm text-neutral-500">No image selected</div>
                        )}
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Or paste an Image URL (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell adopters about personality, training, habits..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="healthDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Health Details</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Vaccinated, neutered/spayed, allergies, ongoing meds..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <div className="font-medium">Good with</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <FormField
                        control={form.control}
                        name="goodWith.kids"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                            </FormControl>
                            <FormLabel className="font-normal">Kids</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="goodWith.dogs"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                            </FormControl>
                            <FormLabel className="font-normal">Dogs</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="goodWith.cats"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                            <FormControl>
                              <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                            </FormControl>
                            <FormLabel className="font-normal">Cats</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Medical records (optional)</div>
                        <div className="text-sm text-muted-foreground">
                          Add vaccinations, surgeries, meds, allergies, and other history.
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          medicalRecords.append({
                            recordType: "",
                            recordDate: "",
                            description: "",
                            vetName: "",
                            attachmentUrl: "",
                            notes: "",
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add record
                      </Button>
                    </div>

                    {medicalRecords.fields.length === 0 ? (
                      <div className="text-sm text-neutral-600">No records added.</div>
                    ) : (
                      <div className="space-y-6">
                        {medicalRecords.fields.map((field, idx) => (
                          <div key={field.id} className="rounded-lg border p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">Record #{idx + 1}</div>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => medicalRecords.remove(idx)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`medicalRecords.${idx}.recordType`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Vaccination" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`medicalRecords.${idx}.recordDate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name={`medicalRecords.${idx}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Rabies vaccination" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`medicalRecords.${idx}.vetName`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Vet name (optional)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Dr. Smith" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`medicalRecords.${idx}.attachmentUrl`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Attachment URL (optional)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="https://..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name={`medicalRecords.${idx}.notes`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes (optional)</FormLabel>
                                  <FormControl>
                                    <Textarea rows={3} placeholder="Extra details..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setLocation("/profile")}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#4A6FA5] hover:bg-[#3A5A87]"
                      disabled={createListingMutation.isPending}
                    >
                      {createListingMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Create Listing"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </>
  );
}

