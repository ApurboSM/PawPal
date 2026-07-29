import { Link, useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { format } from "date-fns";
import type { Payment, PaymentMethod, PaymentPurpose, PaymentStatus, Pet } from "@pawpal/shared/schema";
import { ArrowLeft, CheckCircle2, Clock, Landmark, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailSkeleton } from "@/components/skeletons/page-skeletons";
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
  PAYMENT_PURPOSE_LABELS,
  PAYMENT_STATUS_META,
  findPaymentMethod,
  formatAmount,
} from "@/lib/payment-methods";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const STATUS_ICON = {
  pending: Clock,
  verified: CheckCircle2,
  rejected: XCircle,
} as const;

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="mb-1 text-sm text-neutral-500">{label}</p>
      <p className="font-semibold break-words">{value}</p>
    </div>
  );
}

export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: payment, isLoading } = useQuery<Payment>({
    queryKey: [`/api/payments/${id}`],
  });

  const { data: pet } = useQuery<Pet>({
    queryKey: [`/api/pets/${payment?.petId}`],
    enabled: Boolean(payment?.petId),
  });

  const withdraw = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/payments/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Payment withdrawn", description: "The submission has been removed." });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      navigate("/payments");
    },
    onError: (error: Error) => {
      toast({ title: "Could not withdraw", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-neutral-100 py-10">
        <div className="container mx-auto px-4">
          <DetailSkeleton />
        </div>
      </main>
    );
  }

  if (!payment) {
    return (
      <main className="min-h-screen bg-neutral-100 py-10">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment not found</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/payments">
                <Button variant="outline">Back to my payments</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const method = findPaymentMethod(payment.method as PaymentMethod);
  const status = PAYMENT_STATUS_META[payment.status as PaymentStatus] ?? PAYMENT_STATUS_META.pending;
  const StatusIcon = STATUS_ICON[payment.status as PaymentStatus] ?? Clock;

  return (
    <>
      <Helmet>
        <title>{`Payment #${payment.id} - PawPal`}</title>
      </Helmet>

      <main className="min-h-screen bg-neutral-100 py-10">
        <div className="container mx-auto max-w-4xl px-4 space-y-6">
          <Link href="/payments">
            <Button variant="ghost" className="text-[#4A6FA5]">
              <ArrowLeft className="mr-2 h-4 w-4" /> My payments
            </Button>
          </Link>

          {/* Receipt header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border shadow-sm"
            style={{ background: method?.surface ?? "#fff" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-4">
                {method?.logo ? (
                  <img src={method.logo} alt="" className="h-10 w-auto max-w-[120px] object-contain" />
                ) : (
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                    style={{ background: method?.accent ?? "#4A6FA5" }}
                  >
                    <Landmark className="h-5 w-5" />
                  </span>
                )}
                <div>
                  <p className="text-sm text-neutral-600">Payment #{payment.id}</p>
                  <p className="text-3xl font-bold text-neutral-900">
                    {formatAmount(payment.amount, payment.currency)}
                  </p>
                </div>
              </div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${status.className}`}
              >
                <StatusIcon className="h-4 w-4" />
                {status.label}
              </motion.div>
            </div>

            <p className="border-t border-white/60 bg-white/50 px-6 py-3 text-sm text-neutral-700">
              {status.description}
            </p>
          </motion.div>

          {payment.adminNote && (
            <Card className="border-l-4 border-l-[#4A6FA5]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Note from PawPal</CardTitle>
              </CardHeader>
              <CardContent className="text-neutral-700">{payment.adminNote}</CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Transaction details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Row label="Method" value={method?.name ?? payment.method} />
                <Row
                  label="Purpose"
                  value={
                    PAYMENT_PURPOSE_LABELS[payment.purpose as PaymentPurpose] ?? payment.purpose
                  }
                />
                <Row
                  label={method?.transactionLabel ?? "Transaction ID"}
                  value={<span className="font-mono">{payment.transactionId}</span>}
                />
                <Row label="Paid at" value={format(new Date(payment.paidAt), "PPp")} />
                <Row label="Account holder" value={payment.senderName} />
                <Row
                  label={method?.senderLabel ?? "Paid from"}
                  value={<span className="font-mono">{payment.senderAccount}</span>}
                />
                {payment.receiverAccount && (
                  <Row
                    label="Sent to"
                    value={<span className="font-mono">{payment.receiverAccount}</span>}
                  />
                )}
                {payment.bankName && <Row label="Bank" value={payment.bankName} />}
                {payment.branchName && <Row label="Branch" value={payment.branchName} />}
                {pet && (
                  <Row
                    label="Pet"
                    value={
                      <Link href={`/pets/${pet.id}`} className="text-[#4A6FA5] hover:underline">
                        {pet.name} · {pet.breed}
                      </Link>
                    }
                  />
                )}
                {payment.appointmentId && (
                  <Row
                    label="Appointment"
                    value={
                      <Link
                        href={`/appointments/${payment.appointmentId}`}
                        className="text-[#4A6FA5] hover:underline"
                      >
                        #{payment.appointmentId}
                      </Link>
                    }
                  />
                )}
                {payment.note && (
                  <div className="md:col-span-2">
                    <Row label="Your note" value={payment.note} />
                  </div>
                )}
              </div>

              {payment.proofUrl && (
                <div className="mt-4">
                  <p className="mb-2 text-sm text-neutral-500">Receipt you uploaded</p>
                  <a href={payment.proofUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={payment.proofUrl}
                      alt="Payment receipt"
                      className="max-h-80 rounded-xl border object-contain transition-transform hover:scale-[1.01]"
                    />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {payment.status === "pending" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 hover:bg-red-50">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Withdraw this submission
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Withdraw this payment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the submission from review. It does not reverse the money you
                    already sent — contact us if you need a refund.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => withdraw.mutate()}
                  >
                    Yes, withdraw
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </main>
    </>
  );
}
