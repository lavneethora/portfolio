import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { Anchor } from "@/components/Anchor";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE_URL, site } from "@/lib/site";
import "./globals.css";

// One family does almost everything. Its width axis is the expressive part:
// condensed for names and headings, extended for the surname in the hero.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

// Only for the orbit's instrument readout.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: site.title,
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ecebdc" },
    { media: "(prefers-color-scheme: dark)", color: "#101316" },
  ],
};

/**
 * Runs before first paint so a saved "lights off" never flashes light.
 * It only ever writes the attribute the stylesheet already understands.
 */
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: SITE_URL,
  email: `mailto:${site.email}`,
  jobTitle: "Software engineer",
  alumniOf: { "@type": "CollegeOrUniversity", name: "Texas Tech University" },
  sameAs: [site.github, site.linkedin],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body>
        <Anchor className="skip-link" href="#work">
          Skip to work
        </Anchor>

        <header className="site-header">
          <nav aria-label="Sections">
            <Anchor href="#work">Work</Anchor>
            <Anchor href="#open-source">Open Source</Anchor>
            <Anchor href="#about">About</Anchor>
            <Anchor href="#contact">Contact</Anchor>
            <ThemeToggle />
          </nav>
        </header>

        {children}

      </body>
    </html>
  );
}
