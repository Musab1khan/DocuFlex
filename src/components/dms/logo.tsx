
"use client";

import { cn } from "@/lib/utils";
import { useDms } from "@/context/dms-context";

export function Logo({ className }: { className?: string }) {
  // The login page does not have the DmsProvider, so we can't reliably get the app name from context here.
  // We'll use a static name for the logo component to ensure it works everywhere.
  const appName = "DocuFlex";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <path
          d="M12 4H24C25.1046 4 26 4.89543 26 6V26C26 27.1046 25.1046 28 24 28H8C6.89543 28 6 27.1046 6 26V10L12 4Z"
          fill="currentColor"
          fillOpacity="0.2"
        />
        <path
          d="M12 4H24C25.1046 4 26 4.89543 26 6V26C26 27.1046 25.1046 28 24 28H8C6.89543 28 6 27.1046 6 26V10M12 4L6 10H12V4Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xl font-bold text-foreground">{appName}</span>
    </div>
  );
}
