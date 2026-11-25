import Faq from "./Faq";
import ToolCards from "./ToolCards";
import { HOME_FAQS } from "../lib/seo";
import "./seo.css";

const Icon = ({ children }) => (
  <span className="seo-ico" aria-hidden="true"><svg viewBox="0 0 24 24">{children}</svg></span>
);

export default function HomeSeoSections() {
  return (
    <div className="seo-wrap">
      <section className="seo-section" aria-labelledby="how">
        <div className="seo-head">
          <h2 className="seo-h2" id="how">How to add subtitles to a video with AI</h2>
          <p className="seo-lead">Three steps. No software to install.</p>
        </div>
        <ol className="seo-steps">
          <li className="seo-step"><span className="seo-num">1</span><h3>Upload</h3><p>Choose any video from your device. MP4, MOV and WEBM work.</p></li>
          <li className="seo-step"><span className="seo-num">2</span><h3>Generate</h3><p>The AI listens and writes subtitles timed to the speech in seconds.</p></li>
          <li className="seo-step"><span className="seo-num">3</span><h3>Edit and export</h3><p>Fix any line, then download SRT or VTT, or burn captions into the video.</p></li>
        </ol>
      </section>

      <section className="seo-section" aria-labelledby="why">
        <div className="seo-head">
          <h2 className="seo-h2" id="why">Accurate even when the audio is hard</h2>
          <p className="seo-lead">Captions keep viewers watching with the sound off, make your video accessible, and give search engines the words you speak.</p>
        </div>
        <ul className="seo-feats">
          <li className="seo-feat"><Icon><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/></Icon><h3>Accents</h3><p>Understands different accents and ways of speaking.</p></li>
          <li className="seo-feat"><Icon><path d="M3 12h2l2-6 4 12 3-9 2 3h5"/></Icon><h3>Background noise</h3><p>Picks out speech from music, traffic and room noise.</p></li>
          <li className="seo-feat"><Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon><h3>Multiple speakers</h3><p>Keeps up when several people talk in the same video.</p></li>
        </ul>
      </section>

      <section className="seo-section" aria-labelledby="tools">
        <div className="seo-head">
          <h2 className="seo-h2" id="tools">Subtitle and caption tools</h2>
          <p className="seo-lead">Pick the format or platform you need.</p>
        </div>
        <ToolCards />
      </section>

      <Faq faqs={HOME_FAQS} />
    </div>
  );
}
