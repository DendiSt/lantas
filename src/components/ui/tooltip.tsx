"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <TooltipPrimitive.Provider delay={150}>{children}</TooltipPrimitive.Provider>;
}

export function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root {...props} />;
}

export function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger {...props} />;
}

export function TooltipContent({
  className,
  side = "top",
  align = "center",
  sideOffset = 8,
  children,
  ...props
}: TooltipPrimitive.Popup.Props & {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}) {
  return (
    <TooltipPrimitive.Portal className="z-[99999]" style={{ zIndex: 99999 }}>
      <TooltipPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        positionMethod="fixed"
        collisionBoundary={[]}
        className="z-[99999] pointer-events-none"
        style={{ zIndex: 99999 }}
      >
        <TooltipPrimitive.Popup
          className={cn(
            "z-[99999] overflow-hidden rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-xl dark:bg-zinc-100 dark:text-zinc-900 border border-slate-700/40 dark:border-zinc-300/40 pointer-events-none select-none tracking-normal whitespace-nowrap animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export function ActionTooltip({
  content,
  children,
  side = "top",
  align = "center",
}: {
  content: React.ReactNode;
  children: React.ReactElement<any>;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}) {
  if (!content) return children;

  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side={side} align={align}>{content}</TooltipContent>
    </Tooltip>
  );
}
