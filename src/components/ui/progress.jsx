"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cn } from "cn";

function Progress({
  className,
  children,
  value,
  ...props
}) {
  return (
    <ProgressPrimitive.Root
      className={cn("relative flex items-center gap-2", className)}
      data-slot="progress"
      value={value}
      {...props}
    >
      <ProgressPrimitive.Track
        className="h-2 w-full overflow-hidden rounded-full bg-primary/15"
        data-slot="progress-track"
      >
        <ProgressPrimitive.Indicator
          className="h-full rounded-full bg-primary transition-[left,width] duration-300 ease-out"
          data-slot="progress-indicator"
        />
      </ProgressPrimitive.Track>
      {children}
    </ProgressPrimitive.Root>
  );
}

export { Progress };
