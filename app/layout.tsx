export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";

const garamond = EB_Garamond({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Gifted - AI-Powered Gift Curation",
  description: "AI-Powered Personal Gifting, Curated with Human Touch",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="overscroll-none">
      <body className={`${garamond.className} overscroll-none`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
