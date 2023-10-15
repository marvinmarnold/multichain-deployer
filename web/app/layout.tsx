import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Multichain Deploy",
  description: "Deploy to multiple EVMs. One transaction, pay gas once.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex min-h-screen flex-col items-center px-24 py-20">
          <Navbar />
          {children}
        </main>
      </body>
    </html>
  );
}
