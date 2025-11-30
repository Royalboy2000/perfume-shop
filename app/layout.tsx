import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Perfume Manager",
  description: "Perfume shop & inventory management dashboard"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-50">
        <div className="pointer-events-none fixed inset-0 -z-10 opacity-60">
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        </div>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
