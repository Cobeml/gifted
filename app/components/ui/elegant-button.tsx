import React from "react";
import { cn } from "@/lib/utils";

interface ElegantButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function ElegantButton({
  children,
  className,
  variant = 'primary',
  ...props
}: ElegantButtonProps) {
  return (
    <button
      className={cn(
        "relative font-garamond text-lg px-8 py-3 transition-all duration-300",
        "border border-black dark:border-white",
        variant === 'primary' && "bg-black text-white hover:bg-opacity-90 dark:bg-white dark:text-black",
        variant === 'secondary' && "bg-transparent text-black hover:bg-black hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-black",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
} 