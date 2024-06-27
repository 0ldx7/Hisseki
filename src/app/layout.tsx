import type { Metadata } from "next";
import "./globals.css";
import { M_PLUS_1p } from "next/font/google";
import { Router } from "next/router";

const MPlus1p = M_PLUS_1p({ subsets: ["latin"], weight: ["300"], display: "swap" });

export const metadata: Metadata = {
  title: "Hisseki",
  description: "文章の入力過程を記憶し、再生する",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${MPlus1p.className} bg-gray-100 text-gray-900`}>
        <header className="bg-gray-800 text-white p-4 shadow-md">
          <div className="container mx-auto flex flex-col items-center sm:flex-row justify-between">
            <h1 className="text-2xl font-bold">Hisseki</h1>
            <p className="mt-2 sm:mt-0">文章の入力過程を記憶し、再生する</p>
          </div>
        </header>
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="bg-gray-800 text-white p-4 shadow-inner">
          <div className="container mx-auto text-center">
            <p>© 2024 Hisseki. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
