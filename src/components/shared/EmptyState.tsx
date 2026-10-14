import * as React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center select-none",
        compact ? "py-8 px-4" : "py-16 px-6",
        className
      )}
    >
      <div
        className={cn(
          "rounded-3xl flex items-center justify-center transition-transform duration-300 hover:scale-105",
          compact
            ? "size-12 bg-slate-100 dark:bg-zinc-800/80 mb-3"
            : "size-16 bg-gradient-to-b from-slate-100 to-slate-200/60 dark:from-zinc-800 dark:to-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/60 shadow-xs mb-4"
        )}
      >
        <Icon
          className={cn(
            "text-slate-400 dark:text-zinc-400",
            compact ? "size-6" : "size-8"
          )}
        />
      </div>

      <h3
        className={cn(
          "font-bold text-slate-900 dark:text-white tracking-tight",
          compact ? "text-sm" : "text-base"
        )}
      >
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            "text-slate-500 dark:text-zinc-400 mt-1 max-w-sm leading-relaxed",
            compact ? "text-xs" : "text-xs sm:text-sm"
          )}
        >
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex items-center gap-2.5 mt-5">
          {action && (
            <Button
              size={compact ? "sm" : "default"}
              onClick={action.onClick}
              className="rounded-xl shadow-xs font-semibold cursor-pointer button-press"
            >
              {action.icon && <action.icon className="size-4 mr-1.5" />}
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="outline"
              size={compact ? "sm" : "default"}
              onClick={secondaryAction.onClick}
              className="rounded-xl font-medium cursor-pointer button-press border-slate-200 dark:border-zinc-800"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
