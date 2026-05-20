import type { Metadata } from "next";
import { Bebas_Neue, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { OrganizationSchema } from "./components/StructuredData";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.1775gaming.com"),
  title: {
    default: "1775 Gaming | AI-Powered Mobile Gaming",
    template: "%s | 1775 Gaming",
  },
  description:
    "Experience the future of mobile gaming. Omniverse: Ascension is an AI-powered mobile RPG with augmented reality combat, real-world health integration, and an AI Game Master. Veteran owned and operated.",
  keywords: [
    "mobile RPG",
    "AI game master",
    "augmented reality gaming",
    "Omniverse Ascension",
    "Mutants and Masterminds mobile",
    "superhero RPG mobile",
    "health gaming",
    "fitness RPG",
    "AI powered gaming",
    "1775 Gaming",
    "veteran owned game studio",
    "TTRPG mobile",
    "indie mobile game",
    "superhero mobile game",
    "AR combat game",
    "mobile gaming 2025",
  ],
  authors: [{ name: "Darin Oehlke" }],
  creator: "1775 Gaming LLC",
  publisher: "1775 Gaming LLC",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.1775gaming.com",
    siteName: "1775 Gaming",
    title: "1775 Gaming | AI-Powered Mobile Gaming",
    description:
      "Omniverse: Ascension — AI gameplay, AR combat, health integration. The future of mobile gaming is here.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "1775 Gaming — AI-Powered Mobile Gaming",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "1775 Gaming | AI-Powered Mobile Gaming",
    description:
      "Omniverse: Ascension — The AI-powered mobile RPG with AR combat and health integration.",
    images: ["/api/og"],
    creator: "@1775Gaming",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bebasNeue.variable} ${ibmPlexSans.variable} bg-marine-black text-silver antialiased`}
      >
        <OrganizationSchema />
        <Navbar />
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
