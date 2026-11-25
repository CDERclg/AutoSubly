

import Link from "next/link";
import { notFound } from "next/navigation";
import Faq from "../../../components/Faq";
import JsonLd from "../../../components/JsonLd";
import ToolCards from "../../../components/ToolCards";
import { SITE_URL, TOOL_PAGES } from "../../../lib/seo";
import "../../../components/seo.css";

export function generateStaticParams() {
  return TOOL_PAGES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = TOOL_PAGES.find((t) => t.slug === slug);
  if (!page) return {};
  const url = `${SITE_URL}/tools/${page.slug}`;
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: page.title, description: page.description, siteName: "AutoSubly" },
    twitter: { card: "summary_large_image", title: page.title, description: page.description },
  };
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const page = TOOL_PAGES.find((t) => t.slug === slug);
  if (!page) notFound();

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: page.h1, item: `${SITE_URL}/tools/${page.slug}` },
    ],
  };

  return (
    <main className="seo-wrap">
      <JsonLd data={breadcrumbs} />
      <header className="seo-hero">
        <nav className="seo-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link> / {page.h1}</nav>
        <h1 className="seo-h1">{page.h1}</h1>
        <p>{page.intro}</p>
        <Link className="seo-btn" href="/">Upload your video</Link>
      </header>

      <section className="seo-section" aria-labelledby="steps">
        <div className="seo-head"><h2 className="seo-h2" id="steps">How it works</h2></div>
        <ol className="seo-steps">
          {page.steps.map((s, i) => (
            <li className="seo-step" key={s}><span className="seo-num">{i + 1}</span><p style={{ marginTop: 14 }}>{s}</p></li>
          ))}
        </ol>
      </section>

      <Faq faqs={page.faqs} />

      <section className="seo-section" aria-labelledby="more">
        <div className="seo-head"><h2 className="seo-h2" id="more">More tools</h2></div>
        <ToolCards exclude={page.slug} />
      </section>
    </main>
  );
}
