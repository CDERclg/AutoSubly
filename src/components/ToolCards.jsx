import Link from "next/link";
import { TOOL_PAGES } from "../lib/seo";
import "./seo.css";

export default function ToolCards({ exclude }) {
  return (
    <ul className="seo-cards">
      {TOOL_PAGES.filter((t) => t.slug !== exclude).map((t) => (
        <li key={t.slug}>
          <Link className="seo-card" href={`/tools/${t.slug}`}>
            <span className="seo-card-title">{t.h1}</span>
            <span className="seo-card-cta">Open</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
