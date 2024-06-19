import type { Metadata } from "next";
import "./globals.css";

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
    <body className="min-h-screen bg-black text-white font-sans flex flex-col">
        <header className="p-4 bg-gray-900 text-center">
            <h1 className="text-2xl font-bold">Hisseki</h1>
            <p className="text-sm">文章の入力過程を記憶し、再生する</p>
        </header>
        <main className="flex-grow p-6 max-w-xl mx-auto space-y-4">
            {children}
        </main>
        <footer className="p-4 bg-gray-900 text-center">
            <p className="text-sm">© 2024 Hisseki. All rights reserved.</p>
        </footer>
    </body>
</html>
  );
}
