import type { Metadata } from 'next';
import './globals.css';
import { M_PLUS_1p } from 'next/font/google';

const MPlus1p = M_PLUS_1p({ subsets: ['latin'], weight: ['300'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Hisseki',
  description: '文章の入力過程を記憶し、再生する',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ja' suppressContentEditableWarning>
      <body className={`${MPlus1p.className} flex flex-col min-h-screen bg-white text-black`}>
          {children}
      </body>
    </html>
  );
}
