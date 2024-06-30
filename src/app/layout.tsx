import type { Metadata } from "next";
import "./globals.css";
import { M_PLUS_1p } from "next/font/google";

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
      <body className={`${MPlus1p.className} flex flex-col min-h-screen bg-white text-black`}>
        <header className="bg-white p-4">
          <div className="container mx-auto flex flex-col items-center sm:flex-row justify-between">
            <h1 className="text-2xl tracking-wider font-extrabold">Hisseki</h1>
            <p className="mt-2 sm:mt-0">文章の入力過程を記憶し、再生する</p>
          </div>
        </header>
        <main className="grow container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="bg-white p-4">
          <div className="container mx-auto text-left text-gray-500 text-sm">
            <p>© 2024 Hisseki. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
