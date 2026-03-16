import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import { cn } from "@/lib/utils";
import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RiverFlow — Developer Q&A",
  description:
    "Ask questions, share knowledge, and collaborate with developers worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "bg-black text-white")}>
        <Header />
        {children}
      </body>
    </html>
  );
}
