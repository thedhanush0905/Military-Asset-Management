import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AEGIS - Military Asset Command",
  description: "Enterprise Defense Logistics Platform and Military Asset Management System",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "AEGIS - Military Asset Command",
    description: "Enterprise Defense Logistics Platform and Military Asset Management System",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#2F4F3A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#F5F5F2] dark:bg-[#0B120E]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
