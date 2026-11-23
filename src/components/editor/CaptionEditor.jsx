"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play, Pause, Download, Type, Sparkles,
  Check, Film, Captions, WandSparkles, LoaderCircle,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Styles (same ids as before — the renderer API depends on them).
   `grad` is only used for the 9:16 preset tiles.
───────────────────────────────────────────────────────────── */
const STYLES = [
  { id: "hormozi", name: "Bold Pop", sample: "MAKE IT BIG", color: "#FACC15", bg: "#171717", description: "Bold yellow highlights", grad: "from-amber-500/40 via-orange-900/40 to-neutral-950" },
  { id: "karaoke", name: "Karaoke", sample: "Follow Along", color: "#4ADE80", bg: "#171717", description: "Word-by-word highlight", grad: "from-emerald-500/40 via-emerald-900/40 to-neutral-950" },
  { id: "mrbeast", name: "Viral", sample: "WOW! AMAZING", color: "#38BDF8", bg: "#171717", description: "Bright viral captions", grad: "from-sky-500/40 via-blue-900/40 to-neutral-950" },
  { id: "minimal", name: "Minimal", sample: "Keep it simple", color: "#FFFFFF", bg: "#333333", description: "Clean and elegant", grad: "from-slate-400/30 via-slate-800/50 to-neutral-950" },
];

/* ───────────────────────── logic helpers (unchanged) ───────────────────────── */

function makeChunks(words) {
  const chunks = [];
  let current = [];

  words.forEach((word, index) => {
    current.push({ ...word, originalIndex: index });

    const punctuation = /[.!?]$/.test(word.word || "");
    const pause = index < words.length - 1 &&
      Number(words[index + 1].start) - Number(word.end) > 0.65;

    if (current.length >= 5 || punctuation || pause || index === words.length - 1) {
      chunks.push({
        id: chunks.length,
        start: Number(current[0].start),
        end: Number(current[current.length - 1].end),
        words: current,
        text: current.map(w => w.word).join(" "),
      });
      current = [];
    }
  });

  return chunks;
}

function timeFormat(seconds, separator = ",") {
  const ms = Math.round(Number(seconds) * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const milli = ms % 1000;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}${separator}${String(milli).padStart(3, "0")}`;
}

/* UI-only: friendly m:ss.d clock for the interface */
function clock(seconds) {
  const s = Math.max(0, Number(seconds) || 0);
  const m = Math.floor(s / 60);
  const rest = (s % 60).toFixed(1).padStart(4, "0");
  return `${m}:${rest}`;
}

const pad = n => String(n + 1).padStart(2, "0");

/* ───────────────────────── component ───────────────────────── */

export default function CaptionEditor({ file, words = [], transcript = "" }) {
  const videoRef = useRef(null);
  const listRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [style, setStyle] = useState("hormozi");
  const [fontSize, setFontSize] = useState(30);
  const [selectedChunk, setSelectedChunk] = useState(0);
  const [editedTexts, setEditedTexts] = useState({});
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const chunks = useMemo(() => makeChunks(words), [words]);
  const activeStyle = STYLES.find(s => s.id === style);

  const activeChunk = chunks.findIndex(
    c => currentTime >= c.start && currentTime <= c.end
  );

  const visibleChunk = chunks[activeChunk >= 0 ? activeChunk : selectedChunk];

  const pct = duration ? Math.min(100, (currentTime / duration) * 100) : 0;

  // Live words shown inside the 9:16 style tiles
  const liveText = visibleChunk ? (editedTexts[visibleChunk.id] ?? visibleChunk.text) : "";
  const tileWords = liveText.trim() ? liveText.trim().split(/\s+/).slice(0, 3) : null;

  useEffect(() => {
    if (!file) {
      setVideoUrl("");
      return;
    }

    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (activeChunk >= 0) setSelectedChunk(activeChunk);
  }, [activeChunk]);

  // Keep the caption list following playback (scrolls only the list, not the page)
  useEffect(() => {
    const box = listRef.current;
    if (!playing || activeChunk < 0 || !box) return;
    const el = box.querySelector(`[data-chunk="${activeChunk}"]`);
    if (!el) return;
    box.scrollTo({
      top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2,
      behavior: "smooth",
    });
  }, [activeChunk, playing]);

  function togglePlayback() {
    if (!videoRef.current) return;

    if (videoRef.current.paused) videoRef.current.play();
    else videoRef.current.pause();
  }

  function jumpToChunk(chunk) {
    if (!videoRef.current) return;

    videoRef.current.currentTime = chunk.start;
    setCurrentTime(chunk.start);
    setSelectedChunk(chunk.id);
  }

  function updateChunk(index, value) {
    setEditedTexts(prev => ({ ...prev, [index]: value }));
  }

  function downloadText(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportSubtitles(format) {
    const content = chunks.map((chunk, index) => {
      const text = editedTexts[index] ?? chunk.text;

      return format === "srt"
        ? `${index + 1}\n${timeFormat(chunk.start)} --> ${timeFormat(chunk.end)}\n${text}\n`
        : `${timeFormat(chunk.start, ".")} --> ${timeFormat(chunk.end, ".")}\n${text}\n`;
    }).join("\n");

    downloadText(
      format === "vtt" ? `WEBVTT\n\n${content}` : content,
      `autosubly.${format}`,
      format === "srt" ? "application/x-subrip" : "text/vtt"
    );
  }

  async function exportMP4() {
    if (!file || !words.length) return;

    setExporting(true);
    setExportError("");

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("words", JSON.stringify(words));
      form.append("style", style);
      form.append("editedTexts", JSON.stringify(editedTexts));

      const response = await fetch("/api/render", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Rendering failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "autosubly-captioned.mp4";
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setExportError(error.message || "Unable to export video.");
    } finally {
      setExporting(false);
    }
  }

  /* ───────────────────────── UI ───────────────────────── */

  const panel = "rounded-3xl border border-white/10 bg-white/[0.03]";
  const label = "text-[11px] font-bold uppercase tracking-widest text-white/40";

  return (
    <section className="w-[90vw] max-w-[1800px] mx-auto py-8 sm:py-12">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0a11] p-4 sm:p-6 lg:p-8 shadow-2xl shadow-violet-950/40">

        {/* ambient glow */}
        <div aria-hidden className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-violet-600/25 blur-[120px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[120px]" />

        <div className="relative">

          {/* ───────── Header ───────── */}
          <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-300">
                <Sparkles size={13} />
                AutoSubly Studio
              </div>

              <h2 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-white">
                Make it{" "}
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  pop.
                </span>
              </h2>

              <p className="mt-2 text-sm text-white/50">
                Your words. Your style. Your masterpiece.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Transcript ready
            </div>
          </div>

          {/* ───────── Workspace: captions | preview | style ───────── */}
          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[300px_minmax(0,1fr)_380px] xl:gap-6">

            {/* ── Captions list ── */}
            <div className="relative order-3 lg:col-span-2 xl:order-1 xl:col-span-1 xl:min-h-[620px]">
              <div className={`${panel} flex flex-col xl:absolute xl:inset-0`}>
                <div className="flex items-center justify-between p-4 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Captions size={17} className="text-violet-400" />
                      <h3 className="font-bold text-white">Your captions</h3>
                    </div>
                    <p className="mt-1 text-[11px] text-white/40">Tap one to jump to it.</p>
                  </div>
                  <span className="rounded-full bg-violet-500/20 px-2.5 py-1 text-[11px] font-bold text-violet-200">
                    {chunks.length} blocks
                  </span>
                </div>

                <div
                  ref={listRef}
                  className="relative grid max-h-[420px] grid-cols-1 content-start gap-2 overflow-y-auto px-3 pb-3 md:grid-cols-2 xl:min-h-0 xl:max-h-none xl:flex-1 xl:grid-cols-1"
                >
                  {chunks.map(chunk => {
                    const selected = selectedChunk === chunk.id;
                    const live = activeChunk === chunk.id;

                    return (
                      <button
                        key={chunk.id}
                        data-chunk={chunk.id}
                        onClick={() => jumpToChunk(chunk)}
                        className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                          selected
                            ? "border-violet-400/60 bg-violet-500/15"
                            : "border-white/5 bg-white/[0.03] hover:bg-white/[0.07]"
                        }`}
                      >
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-black tracking-wider ${
                              live
                                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                                : "bg-white/10 text-violet-300"
                            }`}
                          >
                            #{pad(chunk.id)}
                          </span>
                          <span className="text-[10px] tabular-nums text-white/40">
                            {clock(chunk.start)} – {clock(chunk.end)}
                          </span>
                        </div>

                        <p className="break-words text-[13px] leading-snug text-white/85">
                          {editedTexts[chunk.id] ?? chunk.text}
                        </p>
                      </button>
                    );
                  })}

                  {!chunks.length && (
                    <p className="p-3 text-sm text-white/40">
                      No word-level timestamps found.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Live preview ── */}
            <div className={`${panel} order-1 flex min-w-0 flex-col p-4 sm:p-6 xl:order-2`}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Film size={16} className="text-violet-400" />
                  Live preview
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white/70">
                    {clock(currentTime)} / {clock(duration)}
                  </span>
                  <span className="rounded-full bg-violet-500/20 px-2.5 py-1 text-[11px] font-bold text-violet-300">
                    9:16
                  </span>
                </div>
              </div>

              {/* phone frame */}
              <div className="relative flex justify-center py-2">
                <div aria-hidden className="pointer-events-none absolute inset-0 m-auto h-3/4 w-1/2 rounded-full bg-violet-600/20 blur-[90px]" />

                <div
                  onClick={togglePlayback}
                  className="relative aspect-[9/16] cursor-pointer overflow-hidden rounded-[1.75rem] bg-black ring-1 ring-white/15 shadow-[0_30px_80px_-20px_rgba(124,58,237,0.55)]"
                  style={{
                    width: "min(100%, calc(70vh * 9 / 16), 400px)",
                    containerType: "inline-size",
                  }}
                >
                  {videoUrl ? (
                    <>
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        playsInline
                        preload="metadata"
                        onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
                        onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
                        onPlay={() => setPlaying(true)}
                        onPause={() => setPlaying(false)}
                        className="absolute inset-0 h-full w-full object-contain"
                      />

                      {!playing && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 backdrop-blur-md">
                            <Play size={24} className="ml-0.5 text-white" fill="currentColor" />
                          </div>
                        </div>
                      )}

                      {visibleChunk && (
                        <div className="pointer-events-none absolute inset-x-3 bottom-[18%] flex justify-center">
                          <div
                            className="rounded-lg px-3 py-2 text-center font-black uppercase leading-tight"
                            style={{
                              fontSize: `clamp(12px, ${fontSize / 3.6}cqw, 56px)`,
                              color: activeStyle.color,
                              background: activeStyle.bg,
                              textShadow: "2px 3px 4px #000",
                              maxWidth: "95%",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {style === "karaoke"
                              ? visibleChunk.words.map(word => {
                                  const active =
                                    currentTime >= Number(word.start) &&
                                    currentTime <= Number(word.end);

                                  return (
                                    <span
                                      key={word.originalIndex}
                                      style={{
                                        color: active ? "#4ADE80" : "#FFFFFF",
                                        marginRight: "7px",
                                      }}
                                    >
                                      {word.word}
                                    </span>
                                  );
                                })
                              : editedTexts[visibleChunk.id] ?? visibleChunk.text}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white/40">
                      <Film size={38} className="mb-3 text-violet-400" />
                      <p className="text-sm">Your video preview will appear here.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* transport */}
              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={togglePlayback}
                  disabled={!videoUrl}
                  aria-label={playing ? "Pause" : "Play"}
                  className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-600/40 transition hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                >
                  {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-0.5" fill="currentColor" />}
                </button>

                <div className="relative flex h-6 min-w-0 flex-1 items-center">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div
                    className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-white shadow-md shadow-black/50"
                    style={{ left: `${pct}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={duration || 1}
                    step="0.01"
                    value={Math.min(currentTime, duration || 1)}
                    onChange={e => {
                      const time = Number(e.target.value);
                      if (videoRef.current) videoRef.current.currentTime = time;
                      setCurrentTime(time);
                    }}
                    aria-label="Seek"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>
              </div>

              {/* caption timeline strip */}
              <div className="mt-5">
                <div className={`mb-2 flex items-center justify-between ${label}`}>
                  <span>Caption timeline</span>
                  <span>{chunks.length} blocks</span>
                </div>

                <div className="relative h-10 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
                  {duration > 0 && chunks.map(chunk => {
                    const left = (chunk.start / duration) * 100;
                    const width = Math.max(((chunk.end - chunk.start) / duration) * 100, 0.6);

                    return (
                      <button
                        key={chunk.id}
                        onClick={e => { e.stopPropagation(); jumpToChunk(chunk); }}
                        aria-label={`Caption ${pad(chunk.id)}`}
                        title={editedTexts[chunk.id] ?? chunk.text}
                        className={`absolute bottom-1.5 top-1.5 cursor-pointer rounded-md transition ${
                          selectedChunk === chunk.id
                            ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_14px_rgba(167,139,250,0.7)]"
                            : "bg-white/20 hover:bg-white/35"
                        }`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                      />
                    );
                  })}

                  <div
                    className="pointer-events-none absolute inset-y-0 w-0.5 bg-white"
                    style={{ left: `${pct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ── Caption magic ── */}
            <div className={`${panel} order-2 flex flex-col p-5 xl:order-3`}>
              <div className="mb-5 flex items-center gap-2">
                <WandSparkles size={19} className="text-violet-400" />
                <h3 className="text-lg font-bold text-white">Caption magic</h3>
              </div>

              <p className={`mb-3 ${label}`}>Choose your style</p>

              {/* 9:16 style tiles, small gap */}
              <div className="grid grid-cols-4 gap-2">
                {STYLES.map(item => {
                  const selected = style === item.id;
                  const tileText = tileWords ?? item.sample.split(" ");

                  return (
                    <button
                      key={item.id}
                      onClick={() => setStyle(item.id)}
                      title={item.description}
                      className="group cursor-pointer text-center"
                    >
                      <div
                        className={`relative aspect-[9/16] overflow-hidden rounded-xl bg-gradient-to-b ${item.grad} ring-2 transition ${
                          selected
                            ? "ring-violet-400 shadow-[0_0_28px_-4px_rgba(139,92,246,0.8)]"
                            : "ring-white/10 group-hover:ring-white/30"
                        }`}
                      >
                        {/* fake subject so it reads as a video frame */}
                        <div className="absolute left-1/2 top-[20%] h-[17%] w-[34%] -translate-x-1/2 rounded-full bg-white/15" />
                        <div className="absolute left-1/2 top-[38%] h-[32%] w-[66%] -translate-x-1/2 rounded-t-[999px] bg-white/10" />

                        <div className="absolute inset-x-1 bottom-[16%] flex justify-center">
                          <div
                            className="break-words rounded px-1 py-0.5 text-center text-[9px] font-black uppercase leading-tight"
                            style={{
                              background: item.bg,
                              color: item.color,
                              textShadow: "1px 1px 2px #000",
                              maxWidth: "100%",
                            }}
                          >
                            {item.id === "karaoke"
                              ? tileText.map((w, i) => (
                                  <span key={i} style={{ color: i === 0 ? "#4ADE80" : "#FFFFFF", marginRight: 3 }}>
                                    {w}
                                  </span>
                                ))
                              : tileText.join(" ")}
                          </div>
                        </div>

                        {selected && (
                          <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-white shadow">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <p className={`mt-2 text-[11px] font-bold ${selected ? "text-white" : "text-white/55"}`}>
                        {item.name}
                      </p>
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-xs text-white/45">{activeStyle.description}</p>

              {/* font size */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold text-white/80">
                    <Type size={16} className="text-violet-400" />
                    Font size
                  </span>
                  <span className="rounded-md bg-violet-500/20 px-2 py-0.5 text-xs font-bold tabular-nums text-violet-200">
                    {fontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="48"
                  value={fontSize}
                  onChange={e => setFontSize(Number(e.target.value))}
                  className="w-full cursor-pointer accent-violet-500"
                />
              </div>

              {/* edit caption */}
              <div className="mt-6 flex min-h-[180px] flex-1 flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="caption-edit" className={label}>
                    Edit selected caption
                  </label>
                  {visibleChunk && (
                    <span className="text-[11px] font-semibold tabular-nums text-violet-300">
                      #{pad(visibleChunk.id)} · {clock(visibleChunk.start)}
                    </span>
                  )}
                </div>

                {visibleChunk ? (
                  <textarea
                    id="caption-edit"
                    value={editedTexts[visibleChunk.id] ?? visibleChunk.text}
                    onChange={e => updateChunk(visibleChunk.id, e.target.value)}
                    className="min-h-[110px] w-full flex-1 resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/40"
                    placeholder="Your words appear here..."
                  />
                ) : (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/15 p-4 text-center text-sm text-white/40">
                    Play your video to select a caption.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ───────── Export ───────── */}
          <div className="relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/30 via-fuchsia-600/20 to-indigo-600/20 p-5 sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles size={17} className="text-violet-300" />
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-violet-200">
                    Almost there
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white">Ready to export?</h3>
                <p className="mt-1.5 text-sm text-violet-100/70">
                  Your captions are ready. Choose your download format.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1.5fr] lg:min-w-[560px]">
                <button
                  onClick={() => exportSubtitles("srt")}
                  disabled={!chunks.length}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 p-4 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-40"
                >
                  <Download size={17} /> SRT
                </button>

                <button
                  onClick={() => exportSubtitles("vtt")}
                  disabled={!chunks.length}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 p-4 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-40"
                >
                  <Download size={17} /> VTT
                </button>

                <button
                  onClick={exportMP4}
                  disabled={exporting || !file || !words.length}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white p-4 text-sm font-bold text-violet-700 shadow-xl shadow-violet-500/30 transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {exporting ? (
                    <><LoaderCircle className="animate-spin" size={18} /> Rendering...</>
                  ) : (
                    <><Download size={18} /> Export MP4</>
                  )}
                </button>
              </div>
            </div>

            {exporting && (
              <p className="mt-4 text-sm text-violet-100/80">
                Rendering your video. Keep this page open.
              </p>
            )}

            {exportError && (
              <p className="mt-4 text-sm text-red-300" role="alert">
                {exportError}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}