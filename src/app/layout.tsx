import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nankilly - Cornish Inspired Textiles",
  description:
    "Handcrafted luxury gifts, accessories and homeware inspired by the Cornish landscape. Made by Emily at Nankilly Farm.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://nankilly.com"),
  openGraph: {
    title: "Nankilly - Cornish Inspired Textiles",
    description: "Handmade gifts inspired by Cornwall. Liberty prints, vintage fabrics, free motion quilting.",
    siteName: "Nankilly",
    locale: "en_GB",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={playfair.variable + " " + outfit.variable}>
      <body>{children}</body>
    </html>
  );
}
