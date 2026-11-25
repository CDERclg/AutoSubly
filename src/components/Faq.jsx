import JsonLd from "./JsonLd";
import "./seo.css";

export default function Faq({ faqs, heading = "Frequently asked questions" }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <section className="seo-section" aria-labelledby="faq-heading">
      <JsonLd data={schema} />
      <div className="seo-head">
        <h2 className="seo-h2" id="faq-heading">{heading}</h2>
      </div>
      <div className="seo-faq">
        {faqs.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
