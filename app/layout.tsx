import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/layout/Sidebar";
import AuthProvider from "@/components/providers/AuthProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Axiom ID | Advanced Biometric Attendance System",
  description: "Next-generation biometric attendance management with ESP32, fingerprint authentication, and real-time analytics. Secure, fast, and beautiful.",
  manifest: "/manifest.json",
  keywords: ["attendance system", "biometric", "fingerprint", "ESP32", "Next.js", "PWA", "time tracking"],
  authors: [{ name: "Vyno87" }],
  openGraph: {
    title: "Axiom ID - Biometric Attendance System",
    description: "Secure attendance tracking with ESP32 hardware and premium web dashboard",
    url: "https://axiom-pearl-six.vercel.app",
    siteName: "Axiom ID",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axiom ID - Biometric Attendance",
    description: "Advanced attendance system with fingerprint authentication",
    images: ["/icon-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white selection:bg-cyan-500/30`}
      >
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider />
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 md:pl-64 transition-all duration-300">
                <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
                  {children}
                </div>
              </main>
            </div>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
