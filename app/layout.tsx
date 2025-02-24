import type { Metadata } from "next";
import { Open_Sans, Barlow, Inter, Lemon } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-open-sans",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-barlow",
});

const inter = Inter({  
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], 
  variable: "--font-inter", 
});

const lemon = Lemon({ 
  subsets: ['latin'],
  weight: '400',
  variable: "--font-lemon",
});

export const metadata: Metadata = {
  title: "Nannies & Mummies App",
  description: "Nannies & Mummies App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} ${barlow.variable} ${inter.variable} ${lemon.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}