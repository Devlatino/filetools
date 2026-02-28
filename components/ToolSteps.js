"use client";

import { Children, cloneElement, isValidElement } from "react";
import { Check } from "lucide-react";

function StepCircle({ number, status }) {
  if (status === "completed") {
    return (
      <div
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md"
        aria-hidden
      >
        <Check size={24} strokeWidth={2.5} />
      </div>
    );
  }
  if (status === "active") {
    return (
      <div
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-sky-500 text-lg font-bold text-white shadow-md ring-2 ring-sky-400/50"
        aria-hidden
      >
        {number}
      </div>
    );
  }
  return (
    <div
      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-600 text-lg font-bold text-slate-400"
      aria-hidden
    >
      {number}
    </div>
  );
}

/**
 * Single step: title + content. Status (completed | active | pending) is injected by ToolSteps.
 * Renders only title and children; the circle is rendered by ToolSteps.
 */
export function ToolStep({ status, title, children }) {
  return (
    <>
      <h3
        className={`text-sm font-semibold ${
          status === "active" ? "text-sky-100" : status === "completed" ? "text-emerald-100" : "text-slate-400"
        }`}
      >
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </>
  );
}

/**
 * Wrapper that renders a vertical stepper: circles + connectors on the left, step content on the right.
 * currentStep: 1 | 2 | 3 (which step is active). Lower steps become completed (green + check), higher steps pending (gray).
 * Children must be ToolStep elements with title and content.
 */
export function ToolSteps({ currentStep, children }) {
  const steps = Children.toArray(children).filter(
    (child) => isValidElement(child) && child.type === ToolStep
  );

  const getStatus = (stepIndex) => {
    const stepNum = stepIndex + 1;
    if (stepNum < currentStep) return "completed";
    if (stepNum === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <StepCircle number={index + 1} status={getStatus(index)} />
            {index < steps.length - 1 && (
              <div className="w-0.5 min-h-6 flex-1 bg-slate-700" style={{ minHeight: "2rem" }} aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1 pb-8 last:pb-0">
            {cloneElement(step, { status: getStatus(index) })}
          </div>
        </div>
      ))}
    </div>
  );
}

ToolSteps.Step = ToolStep;
