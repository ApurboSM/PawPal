import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { Helmet } from "react-helmet";
import type { Pet, PaymentMethod, Payment } from "@pawpal/shared/schema";
import { ArrowLeft, ImageUp, Loader2, Receipt, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
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
import { GatewayPicker } from "@/components/payments/gateway-picker";
import { PaymentInstructions } from "@/components/payments/payment-instructions";
import {
  PAYMENT_PURPOSE_LABELS,
  findPaymentMethod,
  formatAmount,
  type PaymentMethodConfig,
} from "@/lib/payment-methods";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

const paymentPurposes = [
  "pet_purchase",
  "adoption_fee",
  "appointment_fee",
  "donation",
  "other",
] as const;

const baseFormSchema = z.object({
  purpose: z.enum(paymentPurposes),
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter the amount you sent, e.g. 1500")
    .refine((value) => Number(value) > 0, "Amount must be more than 0"),
  senderName: z.string().trim().min(2, "Enter the name on the sending account"),
  senderAccount: z.string().trim().min(6, "Enter the number or account you paid from"),
  transactionId: z.string().trim().min(4, "Enter the transaction ID from your confirmation"),
  bankName: z.string().trim().optional(),
  branchName: z.string().trim().optional(),
  paidAt: z.string().min(1, "When did you send it?"),
  note: z.string().trim().max(500, "Keep the note under 500 characters").optional(),
});

/** Bank transfers need a bank name; the wallets do not have one to give. */
const schemaForMethod = (method?: string) =>
  method === "bank"
    ? baseFormSchema.extend({
        bankName: z.string().trim().min(2, "Enter the bank you transferred from"),
      })
    : baseFormSchema;

type PaymentFormValues = z.infer<typeof baseFormSchema>;

/** `datetime-local` wants "YYYY-MM-DDTHH:mm" in local time, not an ISO string. */
const toLocalInputValue = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export default function PaymentNewPage() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const params = useMemo(() => new URLSearchParams(search), [search]);
  const petId = params.get("petId") ? Number(params.get("petId")) : null;
  const appointmentId = params.get("appointmentId") ? Number(params.get("appointmentId")) : null;
  const presetPurpose = params.get("purpose");
  const presetMethod = params.get("method");

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodConfig | null>(
    findPaymentMethod(presetMethod) ?? null,
  );
  const [proofFile, setProofFile] = useState<File | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  const { data: pet } = useQuery<Pet>({
    queryKey: [`/api/pets/${petId}`],
    enabled: Boolean(petId),
  });

  const form = useForm<PaymentFormValues>({
    // The gateway lives outside the form, so its rule is applied at resolve
    // time rather than baked into a single static schema.
    resolver: (values, context, options) =>
      zodResolver(schemaForMethod(selectedMethod?.id))(values, context, options),
    defaultValues: {
      purpose: (paymentPurposes as readonly string[]).includes(presetPurpose ?? "")
        ? (presetPurpose as PaymentFormValues["purpose"])
        : petId
          ? "pet_purchase"
          : "other",
      amount: params.get("amount") ?? "",
      senderName: user?.name ?? "",
      senderAccount: "",
      transactionId: "",
      bankName: "",
      branchName: "",
      paidAt: toLocalInputValue(new Date()),
      note: "",
    },
  });

  // The signed-in user's name arrives after the first render.
  useEffect(() => {
    if (user?.name && !form.getValues("senderName")) {
      form.setValue("senderName", user.name);
    }
  }, [user?.name]);

  const submitPayment = useMutation({
    mutationFn: async (values: PaymentFormValues) => {
      if (!selectedMethod) throw new Error("Choose how you paid first");

      let proofUrl: string | undefined;
      if (proofFile) {
        const body = new FormData();
        body.append("file", proofFile);
        const uploadRes = await fetch("/api/uploads/payment-proof", {
          method: "POST",
          body,
          credentials: "include",
        });
        if (!uploadRes.ok) throw new Error((await uploadRes.text()) || "Failed to upload the receipt");
        proofUrl = ((await uploadRes.json()) as { url: string }).url;
      }

      const response = await apiRequest("POST", "/api/payments", {
        method: selectedMethod.id as PaymentMethod,
        purpose: values.purpose,
        petId,
        appointmentId,
        amount: values.amount,
        currency: "BDT",
        receiverAccount: selectedMethod.account,
        senderName: values.senderName,
        senderAccount: values.senderAccount,
        transactionId: values.transactionId,
        bankName: selectedMethod.id === "bank" ? values.bankName : undefined,
        branchName: selectedMethod.id === "bank" ? values.branchName : undefined,
        paidAt: new Date(values.paidAt).toISOString(),
        note: values.note,
        proofUrl,
      });
      return (await response.json()) as Payment;
    },
    onSuccess: (payment) => {
      toast({
        title: "Payment submitted",
        description: "We will confirm it once we match the transaction in our account.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      navigate(`/payments/${payment.id}`);
    },
    onError: (error: Error) => {
      // The server replies "409: {json}" for a re-used transaction ID.
      const isDuplicate = error.message.includes("409");
      toast({
        title: isDuplicate ? "Already submitted" : "Could not submit payment",
        description: isDuplicate
          ? "That transaction ID is already on record. Check your payments list."
          : error.message,
        variant: "destructive",
      });
    },
  });

  const chooseMethod = (method: PaymentMethodConfig) => {
    setSelectedMethod(method);
    // Jump straight to the part they now have to fill in.
    window.setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      120,
    );
  };

  const amount = form.watch("amount");

  return (
    <>
      <Helmet>
        <title>Submit a Payment - PawPal</title>
        <meta
          name="description"
          content="Paid through bKash, Rocket, Nagad, Upay or bank transfer? Submit your transaction details so PawPal can confirm your payment."
        />
      </Helmet>

      <main className="min-h-screen bg-neutral-100 py-10">
        <div className="container mx-auto px-4">
          <Link href="/payments">
            <Button variant="ghost" className="mb-2 text-[#4A6FA5]">
              <ArrowLeft className="mr-2 h-4 w-4" /> My payments
            </Button>
          </Link>

          <div className="mb-8 max-w-2xl">
            <h1 className="text-3xl font-bold">Submit a payment</h1>
            <p className="mt-2 text-neutral-600">
              PawPal does not charge your wallet or card. Send the money yourself from bKash,
              Rocket, Nagad, Upay or your bank, then report the transaction here so we can match
              it and confirm.
            </p>
          </div>

          {pet && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-4 rounded-2xl border bg-white p-4"
            >
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="h-16 w-16 rounded-xl border object-cover"
              />
              <div>
                <p className="text-sm text-neutral-500">Paying for</p>
                <p className="font-semibold">
                  {pet.name} · {pet.breed}
                </p>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_1fr]">
            {/* Step 1 — gateway */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-[#FF6B98]" />
                  How did you pay?
                </CardTitle>
                <CardDescription>
                  Pick the wallet or bank you sent the money from.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GatewayPicker
                  value={(selectedMethod?.id as PaymentMethod) ?? null}
                  onChange={chooseMethod}
                />
              </CardContent>
            </Card>

            {/* Step 2 — instructions */}
            <div>
              <AnimatePresence mode="wait">
                {selectedMethod ? (
                  <PaymentInstructions method={selectedMethod} />
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed bg-white p-6 text-center"
                  >
                    <Receipt className="mb-3 h-8 w-8 text-neutral-300" />
                    <p className="font-medium text-neutral-700">Choose a payment method</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      We will show you the account to send to and what details to report back.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Step 3 — the report */}
          <AnimatePresence>
            {selectedMethod && (
              <motion.div
                ref={formRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mt-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Payment details</CardTitle>
                    <CardDescription>
                      Copy these straight from your {selectedMethod.name} confirmation message.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit((values) => submitPayment.mutate(values))}
                        className="space-y-5"
                      >
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="purpose"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>What is this payment for?</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a purpose" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {paymentPurposes.map((purpose) => (
                                      <SelectItem key={purpose} value={purpose}>
                                        {PAYMENT_PURPOSE_LABELS[purpose]}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Amount sent (BDT)</FormLabel>
                                <FormControl>
                                  <Input inputMode="decimal" placeholder="1500" {...field} />
                                </FormControl>
                                <FormDescription>
                                  {amount && /^\d+(\.\d{1,2})?$/.test(amount)
                                    ? `You are reporting ${formatAmount(amount)}`
                                    : "Exactly what left your account, including any fee you covered."}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="senderName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account holder name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Name on the sending account" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="senderAccount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{selectedMethod.senderLabel}</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={selectedMethod.senderPlaceholder}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="transactionId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{selectedMethod.transactionLabel}</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={selectedMethod.transactionPlaceholder}
                                    className="font-mono"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  This is how we find your transfer — it must match exactly.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="paidAt"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>When did you send it?</FormLabel>
                                <FormControl>
                                  <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {selectedMethod.id === "bank" && (
                            <>
                              <FormField
                                control={form.control}
                                name="bankName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Your bank</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g. BRAC Bank" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="branchName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Branch (optional)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g. Gulshan" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          )}
                        </div>

                        <FormField
                          control={form.control}
                          name="note"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Note (optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Anything that helps us match this payment — the pet's name, an appointment date, or who paid on your behalf."
                                  className="min-h-[90px] resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Proof upload */}
                        <div className="space-y-2">
                          <FormLabel>Receipt screenshot (optional)</FormLabel>
                          {proofFile ? (
                            <div className="flex items-center justify-between rounded-xl border bg-neutral-50 p-3">
                              <span className="truncate text-sm">{proofFile.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setProofFile(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-4 transition-colors hover:border-[#FF6B98] hover:bg-pink-50/40">
                              <ImageUp className="h-5 w-5 text-[#FF6B98]" />
                              <span className="text-sm text-neutral-600">
                                Attach the confirmation screenshot or deposit slip (max 5MB)
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
                              />
                            </label>
                          )}
                        </div>

                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          <Button
                            type="submit"
                            size="lg"
                            className="w-full text-white shadow-lg"
                            style={{ background: selectedMethod.accent }}
                            disabled={submitPayment.isPending}
                          >
                            {submitPayment.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting…
                              </>
                            ) : (
                              <>Submit {selectedMethod.name} payment</>
                            )}
                          </Button>
                        </motion.div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
