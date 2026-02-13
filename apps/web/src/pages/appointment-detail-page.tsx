import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams, Link } from "wouter";
import type { Appointment, Pet } from "@pawpal/shared/schema";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DetailSkeleton } from "@/components/skeletons/page-skeletons";
import { ArrowLeft, Calendar, Clock3, PawPrint, FileText, MapPin, ShieldCheck } from "lucide-react";

function appointmentTypeLabel(type?: string) {
  if (type === "meet_and_greet") return "Meet & Greet";
  if (type === "veterinary_care") return "Veterinary Care";
  if (type === "grooming") return "Grooming Services";
  return type ?? "Appointment";
}

function appointmentStatusTone(dateValue?: Date | string | null) {
  if (!dateValue) return { label: "Unknown", className: "bg-neutral-500" };
  const isPast = new Date(dateValue).getTime() < Date.now();
  return isPast
    ? { label: "Past", className: "bg-neutral-500" }
    : { label: "Upcoming", className: "bg-[#4A6FA5]" };
}

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const {
    data: appointment,
    isLoading,
    isError,
  } = useQuery<Appointment>({
    queryKey: [`/api/appointments/${id}`],
    enabled: !!id,
  });

  const { data: pet } = useQuery<Pet>({
    queryKey: [appointment?.petId ? `/api/pets/${appointment.petId}` : ""],
    enabled: Boolean(appointment?.petId),
  });

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

  if (isError || !appointment) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-neutral-100 py-12">
          <div className="container mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Not Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">We couldn’t find this appointment or you may not have access to it.</p>
                <Button onClick={() => setLocation("/profile?tab=appointment-history")}>Back to Profile</Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const status = appointmentStatusTone(appointment.date);

  return (
    <>
      <Helmet>
        <title>Appointment Details - PawPal</title>
        <meta name="description" content="View complete appointment details and related pet information." />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-neutral-100 py-12">
        <div className="container mx-auto px-4 space-y-6">
          <Button variant="ghost" onClick={() => setLocation("/profile?tab=appointment-history")} className="text-[#4A6FA5]">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Profile
          </Button>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-[#4A6FA5]" />
                  {appointmentTypeLabel(appointment.type)}
                </CardTitle>
                <Badge className={`${status.className} text-white`}>{status.label}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-sm text-neutral-500 mb-1">Appointment ID</p>
                  <p className="font-semibold">#{appointment.id}</p>
                </div>
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-sm text-neutral-500 mb-1">Date & Time</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-[#4A6FA5]" />
                    {appointment.date ? new Date(appointment.date).toLocaleString() : "—"}
                  </p>
                </div>
                <div className="rounded-xl border bg-white p-4 md:col-span-2">
                  <p className="text-sm text-neutral-500 mb-1">Notes</p>
                  <p className="text-neutral-700">{appointment.notes?.trim() ? appointment.notes : "No additional notes provided."}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <PawPrint className="h-5 w-5 text-[#4A6FA5]" />
                Pet Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!appointment.petId ? (
                <div className="rounded-xl border bg-white p-4 text-neutral-600">No specific pet selected for this appointment.</div>
              ) : !pet ? (
                <div className="rounded-xl border bg-white p-4 text-neutral-600">Pet information is unavailable.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-1">
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      className="w-full h-64 object-cover rounded-xl border"
                    />
                  </div>
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border bg-white p-4">
                      <p className="text-sm text-neutral-500 mb-1">Name</p>
                      <p className="font-semibold">{pet.name}</p>
                    </div>
                    <div className="rounded-xl border bg-white p-4">
                      <p className="text-sm text-neutral-500 mb-1">Breed</p>
                      <p className="font-semibold">{pet.breed}</p>
                    </div>
                    <div className="rounded-xl border bg-white p-4">
                      <p className="text-sm text-neutral-500 mb-1">Species / Size</p>
                      <p className="font-semibold">{pet.species} · {pet.size}</p>
                    </div>
                    <div className="rounded-xl border bg-white p-4">
                      <p className="text-sm text-neutral-500 mb-1">Location</p>
                      <p className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-[#4A6FA5]" />{pet.location}</p>
                    </div>
                    <div className="rounded-xl border bg-white p-4 md:col-span-2">
                      <p className="text-sm text-neutral-500 mb-1 flex items-center gap-2"><FileText className="h-4 w-4 text-[#4A6FA5]" />Description</p>
                      <p className="text-neutral-700">{pet.description}</p>
                    </div>
                    <div className="rounded-xl border bg-white p-4 md:col-span-2">
                      <p className="text-sm text-neutral-500 mb-1 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#4A6FA5]" />Health Details</p>
                      <p className="text-neutral-700">{pet.healthDetails}</p>
                    </div>
                  </div>
                </div>
              )}

              {appointment.petId && (
                <div className="mt-5">
                  <Link href={`/pets/${appointment.petId}`}>
                    <Button variant="outline" className="border-[#4A6FA5] text-[#4A6FA5]">View Full Pet Profile</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </>
  );
}
