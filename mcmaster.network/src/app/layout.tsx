import type { Metadata } from "next";
import "@fontsource-variable/big-shoulders-stencil-display";
import "@fontsource-variable/archivo/wdth";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib";

const description = "A webring for McMaster students with personal websites.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description,
  icons: { icon: "/icon.svg" },
  openGraph: { title: SITE_NAME, description, type: "website" },
  twitter: { card: "summary", title: SITE_NAME, description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
