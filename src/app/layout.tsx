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
    <body className="">
        <header className="">
            <h1 className="">Hisseki</h1>
            <p className="">文章の入力過程を記憶し、再生する</p>
        </header>
        <main className="">
            {children}
        </main>
        <footer className="">
            <p className="">© 2024 Hisseki. All rights reserved.</p>
        </footer>
    </body>
</html>
  );
}
