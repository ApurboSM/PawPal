import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import type { Payment, PaymentMethod, PaymentPurpose, PaymentStatus } from "@pawpal/shared/schema";
import { ArrowRight, Landmark, Plus, Receipt } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListRowsSkeleton } from "@/components/skeletons/page-skeletons";
import {
  PAYMENT_METHODS,
  PAYMENT_PURPOSE_LABELS,
  PAYMENT_STATUS_META,
  findPaymentMethod,
  formatAmount,
} from "@/lib/payment-methods";

function StatusBadge({ status }: { status: string }) {
  const meta = PAYMENT_STATUS_META[status as PaymentStatus] ?? PAYMENT_STATUS_META.pending;
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}

export default function PaymentsPage() {
  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  return (
    <>
      <Helmet>
        <title>My Payments - PawPal</title>
        <meta
          name="description"
          content="Track the payments you have reported to PawPal and submit a new bKash, Rocket, Nagad, Upay or bank transfer."
        />
      </Helmet>

      <main className="min-h-screen bg-neutral-100 py-10">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">My payments</h1>
              <p className="mt-2 max-w-2xl text-neutral-600">
                Every transfer you report shows up here with its review status. Payments are
                confirmed manually once we match them in the receiving account.
              </p>
            </div>
            <Link href="/payments/new">
              <Button size="lg" className="bg-[#FF6B98] text-white hover:bg-[#e85c87]">
                <Plus className="mr-2 h-4 w-4" />
                Submit a payment
              </Button>
            </Link>
          </div>

          {/* Accepted methods */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Accepted payment methods</CardTitle>
              <CardDescription>
                Pay from your own app, then report the transaction. We never ask for your PIN or OTP.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {PAYMENT_METHODS.map((method, index) => (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -3 }}
                    className="flex items-center gap-2 rounded-xl border px-3 py-2"
                    style={{ background: method.surface }}
                  >
                    {method.logo ? (
                      <img src={method.logo} alt="" className="h-6 w-auto max-w-[70px] object-contain" />
                    ) : (
                      <Landmark className="h-5 w-5" style={{ color: method.accent }} />
                    )}
                    <span className="text-sm font-medium text-neutral-700">{method.name}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment history</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ListRowsSkeleton rows={3} />
              ) : payments && payments.length > 0 ? (
                <ul className="space-y-3">
                  {payments.map((payment, index) => {
                    const method = findPaymentMethod(payment.method as PaymentMethod);
                    return (
                      <motion.li
                        key={payment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index, 6) * 0.05 }}
                      >
                        <Link href={`/payments/${payment.id}`}>
                          <div className="group flex flex-wrap items-center gap-4 rounded-xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                            <span
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                              style={{ background: method?.surface ?? "#f5f5f5" }}
                            >
                              {method?.logo ? (
                                <img src={method.logo} alt="" className="h-6 w-auto object-contain" />
                              ) : (
                                <Landmark
                                  className="h-5 w-5"
                                  style={{ color: method?.accent ?? "#4A6FA5" }}
                                />
                              )}
                            </span>

                            <div className="min-w-[140px] flex-1">
                              <p className="font-semibold">
                                {formatAmount(payment.amount, payment.currency)}
                                <span className="ml-2 text-sm font-normal text-neutral-500">
                                  via {method?.name ?? payment.method}
                                </span>
                              </p>
                              <p className="text-sm text-neutral-500">
                                {PAYMENT_PURPOSE_LABELS[payment.purpose as PaymentPurpose] ??
                                  payment.purpose}
                                {" · "}
                                {format(new Date(payment.paidAt), "PP")}
                              </p>
                            </div>

                            <span className="font-mono text-xs text-neutral-500">
                              {payment.transactionId}
                            </span>
                            <StatusBadge status={payment.status} />
                            <ArrowRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1" />
                          </div>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              ) : (
                <div className="py-12 text-center">
                  <Receipt className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
                  <h3 className="mb-2 text-xl font-semibold">No payments yet</h3>
                  <p className="mb-6 text-neutral-600">
                    Once you send money and report it, the transaction will appear here.
                  </p>
                  <Link href="/payments/new">
                    <Button className="bg-[#4A6FA5] hover:bg-[#3A5A87]">Submit a payment</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
