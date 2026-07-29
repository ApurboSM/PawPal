import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import type { Payment, PaymentMethod, PaymentPurpose, PaymentStatus } from "@pawpal/shared/schema";
import { CheckCircle2, Clock, Landmark, Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { ListRowsSkeleton } from "@/components/skeletons/page-skeletons";
import {
  PAYMENT_PURPOSE_LABELS,
  PAYMENT_STATUS_META,
  findPaymentMethod,
  formatAmount,
} from "@/lib/payment-methods";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

/**
 * Verification desk. Payments arrive as customer claims, so the only action here
 * is to confirm or reject one against the receiving account statement — the
 * reported figures themselves are never edited.
 */
export function AdminPaymentsPanel() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [reviewing, setReviewing] = useState<Payment | null>(null);
  const [decision, setDecision] = useState<PaymentStatus>("verified");
  const [adminNote, setAdminNote] = useState("");

  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/admin/payments"],
  });

  const review = useMutation({
    mutationFn: async ({ id, status, note }: { id: number; status: PaymentStatus; note: string }) => {
      const response = await apiRequest("PUT", `/api/admin/payments/${id}`, {
        status,
        adminNote: note.trim() || undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Payment updated", description: "The customer can see the new status." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      setReviewing(null);
      setAdminNote("");
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return payments ?? [];
    return (payments ?? []).filter((payment) =>
      [payment.transactionId, payment.senderName, payment.senderAccount, payment.method, payment.status]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [payments, search]);

  const counts = useMemo(() => {
    const base = { pending: 0, verified: 0, rejected: 0 };
    (payments ?? []).forEach((payment) => {
      if (payment.status in base) base[payment.status as PaymentStatus] += 1;
    });
    return base;
  }, [payments]);

  const openReview = (payment: Payment, status: PaymentStatus) => {
    setReviewing(payment);
    setDecision(status);
    setAdminNote(payment.adminNote ?? "");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Verification</CardTitle>
        <CardDescription>
          Customers pay into the shop accounts directly and report the transaction. Match each one
          against the account statement before confirming.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(
            [
              ["pending", Clock, "text-amber-600 bg-amber-100"],
              ["verified", CheckCircle2, "text-green-600 bg-green-100"],
              ["rejected", XCircle, "text-red-600 bg-red-100"],
            ] as const
          ).map(([key, Icon, tone]) => (
            <Card key={key}>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-sm capitalize text-neutral-500">{key}</p>
                  <p className="text-2xl font-bold">{counts[key]}</p>
                </div>
                <span className={`rounded-full p-2 ${tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by TrxID, name or number"
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <ListRowsSkeleton rows={5} />
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Paid at</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((payment) => {
                  const method = findPaymentMethod(payment.method as PaymentMethod);
                  const status =
                    PAYMENT_STATUS_META[payment.status as PaymentStatus] ??
                    PAYMENT_STATUS_META.pending;

                  return (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          {method?.logo ? (
                            <img src={method.logo} alt="" className="h-5 w-auto object-contain" />
                          ) : (
                            <Landmark
                              className="h-4 w-4"
                              style={{ color: method?.accent ?? "#4A6FA5" }}
                            />
                          )}
                          <span className="font-medium">{method?.name ?? payment.method}</span>
                        </span>
                        {payment.bankName && (
                          <span className="block text-xs text-neutral-500">{payment.bankName}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatAmount(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{payment.transactionId}</TableCell>
                      <TableCell>
                        <span className="block">{payment.senderName}</span>
                        <span className="block font-mono text-xs text-neutral-500">
                          {payment.senderAccount}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {PAYMENT_PURPOSE_LABELS[payment.purpose as PaymentPurpose] ?? payment.purpose}
                        {payment.petId && (
                          <span className="block text-xs text-neutral-500">Pet #{payment.petId}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(payment.paidAt), "PP p")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full border px-2 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {payment.proofUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={payment.proofUrl} target="_blank" rel="noopener noreferrer">
                                Slip
                              </a>
                            </Button>
                          )}
                          {payment.status !== "verified" && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => openReview(payment, "verified")}
                            >
                              Verify
                            </Button>
                          )}
                          {payment.status !== "rejected" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openReview(payment, "rejected")}
                            >
                              Reject
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="py-10 text-center text-neutral-500">No payments to show.</p>
        )}
      </CardContent>

      <Dialog open={Boolean(reviewing)} onOpenChange={(open) => !open && setReviewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decision === "verified" ? "Verify this payment" : "Reject this payment"}
            </DialogTitle>
            <DialogDescription>
              {reviewing && (
                <>
                  {formatAmount(reviewing.amount, reviewing.currency)} ·{" "}
                  <span className="font-mono">{reviewing.transactionId}</span> from{" "}
                  {reviewing.senderName}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-sm font-medium" htmlFor="admin-note">
              Note for the customer {decision === "rejected" && "(explain what was wrong)"}
            </label>
            <Textarea
              id="admin-note"
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
              placeholder={
                decision === "verified"
                  ? "Optional — e.g. Received, thank you."
                  : "e.g. No transfer with this TrxID reached our bKash account."
              }
              className="min-h-[100px] resize-none"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewing(null)}>
              Cancel
            </Button>
            <Button
              className={decision === "verified" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}
              disabled={review.isPending}
              onClick={() =>
                reviewing && review.mutate({ id: reviewing.id, status: decision, note: adminNote })
              }
            >
              {decision === "verified" ? "Confirm payment" : "Reject payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
