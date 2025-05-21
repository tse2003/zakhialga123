import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";

// ✅ Load Geist fonts and assign them to CSS variables
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ТӨГС ЦЭНГЭГ УС ХХК",
  description: "Gmail илгээдэг modern form",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body
        className="antialiased bg-cover bg-center min-h-screen"
        style={{
          backgroundImage: "url('/background.jpg')",
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        <Header />
        {children}

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              border: "1px solid #06b6d4",
              padding: "12px 16px",
              background: "#f0fdfa",
              color: "#0f172a",
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "var(--font-geist-sans)",
              fontWeight: 400,
            },
            success: {
              icon: "✅",
              style: {
                border: "1px solid #22c55e",
                background: "#ecfdf5",
                color: "#166534",
              },
            },
            error: {
              icon: "⚠️",
              style: {
                border: "1px solid #f87171",
                background: "#fef2f2",
                color: "#7f1d1d",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
