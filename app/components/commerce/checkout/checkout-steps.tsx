import type { CheckoutStage } from "@/types/checkout";
import { cn } from "@/lib/utils";

const STEPS: Array<{ stage: CheckoutStage; label: string }> = [
  { stage: "customer", label: "Customer" },
  { stage: "shipping", label: "Shipping" },
  { stage: "payment", label: "Payment" },
  { stage: "placeOrder", label: "Review" },
];

/**
 * Where the shopper is in the flow.
 *
 * Numbers are data, so they are mono; the names are labels. The rail states
 * position and nothing else — it is not a navigation, because a stage behind
 * you is only re-enterable through the work that filled it, which is what
 * base's own steps did too.
 */
export function CheckoutSteps({
  stage,
  registered,
}: {
  stage: CheckoutStage;
  registered: boolean;
}) {
  // A signed-in shopper never sees the customer stage — base fast-forwards
  // past it — so it is not drawn as a step they could be on.
  const steps = registered ? STEPS.filter((s) => s.stage !== "customer") : STEPS;
  const currentIndex = steps.findIndex((step) => step.stage === stage);

  return (
    <ol className="flex flex-wrap items-baseline gap-x-8 gap-y-3 border-b pb-5">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;

        return (
          <li
            key={step.stage}
            aria-current={current ? "step" : undefined}
            className={cn(
              "flex items-baseline gap-2 transition-colors duration-(--motion-fast)",
              current ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <span className="meta-caps">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className={cn("label-caps", done && "line-through")}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
