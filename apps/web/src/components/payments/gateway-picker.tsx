import { motion } from "framer-motion";
import { Check, Landmark } from "lucide-react";
import { PAYMENT_METHODS, type PaymentMethodConfig } from "@/lib/payment-methods";
import type { PaymentMethod } from "@pawpal/shared/schema";
import { cn } from "@/lib/utils";

interface GatewayPickerProps {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethodConfig) => void;
}

/**
 * The gateway wall. Each card is a real radio input underneath, so keyboard and
 * screen-reader users get the same behaviour the pointer animation implies.
 */
export function GatewayPicker({ value, onChange }: GatewayPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Payment method"
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
    >
      {PAYMENT_METHODS.map((method, index) => {
        const isSelected = value === method.id;

        return (
          <motion.button
            key={method.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(method)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border p-4 text-left transition-shadow duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              isSelected ? "border-transparent shadow-xl" : "border-neutral-200 shadow-sm hover:shadow-lg",
            )}
            style={{
              background: method.surface,
              // Tailwind cannot express a per-brand ring, so the selected state
              // is drawn with the method's own colour.
              boxShadow: isSelected ? `0 0 0 2px ${method.accent}, 0 18px 35px -18px ${method.accent}` : undefined,
            }}
          >
            {/* Shine sweep on hover */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-12 bg-white/40 transition-all duration-700 group-hover:left-full"
            />

            <span className="relative flex h-12 items-center">
              {method.logo ? (
                <motion.img
                  src={method.logo}
                  alt=""
                  className="h-10 w-auto max-w-[110px] object-contain"
                  animate={isSelected ? { scale: 1.06 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                />
              ) : (
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  style={{ background: method.accent }}
                >
                  <Landmark className="h-5 w-5" />
                </span>
              )}
            </span>

            <span className="relative mt-3 block text-sm font-semibold text-neutral-800">
              {method.name}
            </span>
            <span className="relative mt-0.5 block text-xs leading-snug text-neutral-600">
              {method.tagline}
            </span>

            {/* Selected badge */}
            <motion.span
              aria-hidden="true"
              initial={false}
              animate={isSelected ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-white"
              style={{ background: method.accent }}
            >
              <Check className="h-4 w-4" />
            </motion.span>
          </motion.button>
        );
      })}
    </div>
  );
}
