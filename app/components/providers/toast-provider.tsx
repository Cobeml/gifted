"use client";

import { ToastProvider as Provider } from "@/app/components/ui/toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      {children}
    </Provider>
  );
} 