import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaymentMethodConfig } from "@/lib/payment-methods";

/**
 * How to pay, for the selected gateway. The account number is the one thing the
 * customer must get exactly right, so it gets a copy button rather than asking
 * them to retype a wallet number from the screen.
 */
export function PaymentInstructions({ method }: { method: PaymentMethodConfig }) {
  const [copied, setCopied] = useState(false);

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(method.account);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the number is on screen either way.
    }
  };

  return (
    <motion.div
      key={method.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="overflow-hidden rounded-2xl border"
      style={{ background: method.surface }}
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {method.logo && (
              <img src={method.logo} alt="" className="h-8 w-auto max-w-[92px] object-contain" />
            )}
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                Send your payment to
              </p>
              <p className="text-xs text-neutral-600">{method.accountLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-white/80 px-3 py-2 font-mono text-base font-semibold tracking-wide text-neutral-900">
              {method.account}
            </span>
            <Button type="button" size="sm" variant="outline" onClick={copyAccount} className="bg-white/80">
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="copied"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="flex items-center"
                  >
                    <Check className="mr-1 h-4 w-4" /> Copied
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="flex items-center"
                  >
                    <Copy className="mr-1 h-4 w-4" /> Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {method.accountType && (
          <p className="mt-2 text-xs font-medium text-neutral-600">{method.accountType}</p>
        )}

        <ol className="mt-4 space-y-2">
          {method.steps.map((step, index) => (
            <motion.li
              key={step}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * index, duration: 0.25 }}
              className="flex gap-3 text-sm text-neutral-700"
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: method.accent }}
              >
                {index + 1}
              </span>
              {step}
            </motion.li>
          ))}
        </ol>

        <p className="mt-4 flex items-start gap-2 rounded-lg bg-white/70 p-3 text-xs text-neutral-600">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#4A6FA5]" />
          PawPal never asks for your PIN, OTP or password. We only need the
          transaction ID printed on your own confirmation message.
        </p>
      </div>
    </motion.div>
  );
}
