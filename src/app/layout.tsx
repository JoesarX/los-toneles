import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import QueryProvider from "@/components/QueryProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import "./toast.css";

config.autoAddCss = false;

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Los Toneles · Comida típica de Tegucigalpa",
    template: "%s · Los Toneles",
  },
  description:
    "Más de 50 años sirviendo la mejor comida típica hondureña en Tegucigalpa. Baleadas, pastelitos, tajadas y más, con el sabor de siempre.",
  keywords: [
    "Los Toneles",
    "comida típica hondureña",
    "Tegucigalpa",
    "baleadas",
    "pastelitos",
    "restaurante Honduras",
  ],
  openGraph: {
    title: "Los Toneles · Comida típica de Tegucigalpa",
    description:
      "Más de 50 años sirviendo la mejor comida típica hondureña en Tegucigalpa.",
    locale: "es_HN",
    type: "website",
    siteName: "Los Toneles",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E3A5F",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${fraunces.variable}`}
    >
      <body className="min-h-screen bg-cream font-sans text-espresso antialiased">
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
        <ToastContainer
          position="bottom-right"
          theme="light"
          autoClose={3200}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          pauseOnHover
          draggable
          limit={4}
          toastClassName="tonel-toast"
        />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
