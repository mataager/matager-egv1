import type { Metadata, Viewport } from "next";
import { Inter, Josefin_Sans, Poiret_One, Reem_Kufi } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG } from "@/config/site";
import { ThemeProvider, noFlashScript } from "@/theme";
import { LanguageProvider } from "@/i18n";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const poiretOne = Poiret_One({
  subsets: ["latin"],
  variable: "--font-poiret",
  display: "swap",
  weight: ["400"],
});

const reemKufi = Reem_Kufi({
  subsets: ["arabic", "latin"],
  variable: "--font-reem-kufi",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} — Next Generation of Commerce`,
  description:
    "The unified ecommerce ecosystem. Multi-vendor marketplaces, instant payments, autonomous logistics, and real-time telemetry — all through one dark-terminal workspace.",
  icons: {
    icon: [
      { url: "/icon.svg?v=2", type: "image/svg+xml" },
      { url: "/favicon.png?v=2", type: "image/png" },
      { url: "/favicon.ico?v=2", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: "/favicon.png?v=2",
  },
  openGraph: {
    title: `${SITE_CONFIG.name} — Next Generation of Commerce`,
    description:
      "The unified ecommerce ecosystem. Multi-vendor marketplaces, instant payments, autonomous logistics, and real-time telemetry.",
    siteName: SITE_CONFIG.name,
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "black",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      data-theme="dark"
      className={`${inter.variable} ${josefinSans.variable} ${poiretOne.variable} ${reemKufi.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="no-flash-script"
          dangerouslySetInnerHTML={{ __html: noFlashScript }}
        />
        <link rel="icon" type="image/svg+xml" href="/icon.svg?v=2" />
        <link rel="icon" type="image/png" sizes="256x256" href="/favicon.png?v=2" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/favicon.png?v=2" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fustat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      </head>
      <body className="font-ui bg-[var(--color-canvas)] text-[var(--color-text-primary)] antialiased transition-colors duration-200">
        <ThemeProvider defaultTheme="dark">
          <LanguageProvider defaultLocale="en">
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
