import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/auth-options";
import { ToastProvider } from "@/app/components/providers/toast-provider";
import { Toaster } from "@/app/components/ui/toaster";

const garamond = EB_Garamond({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Gifted - AI-Powered Gift Curation",
  description: "AI-Powered Personal Gifting, Curated with Human Touch",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning className="overscroll-none">
      <body className={`${garamond.className} overscroll-none`}>
        <ToastProvider>
          <Providers session={session}>
            {children}
          </Providers>
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
