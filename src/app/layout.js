import JsonLd from "../components/JsonLd";
import { SITE_URL, SITE_NAME, TITLE, DESCRIPTION } from "../lib/seo";
import "./globals.css"; // keep your own stylesheet

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["AI subtitle generator", "auto captions", "free subtitle generator", "video to text", "SRT generator", "auto subtitles", "AutoSubly"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: SITE_URL, siteName: SITE_NAME, title: TITLE, description: DESCRIPTION, locale: "en_US" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  // verification: { google: "PASTE_YOUR_SEARCH_CONSOLE_CODE_HERE" },
};

export const viewport = { themeColor: "#0F172A", width: "device-width", initialScale: 1 };

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, alternateName: "Auto Subly", description: DESCRIPTION, inLanguage: "en" },
    { "@type": "Organization", "@id": `${SITE_URL}/#org`, name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 512, height: 512 } },
    { "@type": "SoftwareApplication", name: SITE_NAME, url: SITE_URL, applicationCategory: "MultimediaApplication", operatingSystem: "Web", description: DESCRIPTION, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <JsonLd data={graph} />
        {children}
      </body>
    </html>
  );
}