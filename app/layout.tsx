import type { Metadata } from "next";
import { IBM_Plex_Serif, Manrope } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const ibmPlexSerif = IBM_Plex_Serif({
  variable: "--font-plex",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SuaVitrine - Crie sua vitrine digital em minutos",
  description:
    "Com a SuaVitrine, qualquer pessoa pode montar uma loja online personalizada — sem precisar saber design ou programação. Cadastre-se, adicione seus produtos e receba um link único para compartilhar sua vitrine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${ibmPlexSerif.variable} ${manrope.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
