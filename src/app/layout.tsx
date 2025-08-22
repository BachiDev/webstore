// src/app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers'; // Import the new Providers component

export const metadata: Metadata = {
  title: "Webstore Demo",
  description: "Simulate product and subsription purchases",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
