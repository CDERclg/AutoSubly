
import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";

export const runtime = "nodejs";

const STYLES = {
  hormozi: { color: "#FACC15", bg: "#171717" },
  karaoke: { color: "#4ADE80", bg: "#171717" },
  mrbeast: { color: "#38BDF8", bg: "#171717" },
  minimal: { color: "#FFFFFF", bg: "#333333" },
};

function makeChunks(words) {
  const chunks = [];
  let current = [];

  words.forEach((word, index) => {
    current.push(word);

    const punctuation = /[.!?]$/.test(word.word || "");
    const pause =
      index < words.length - 1 &&
      Number(words[index + 1].start) - Number(word.end) > 0.65;

    if (
      current.length >= 5 ||
      punctuation ||
      pause ||
      index === words.length - 1
    ) {
      chunks.push({
        id: chunks.length,
        start: Number(current[0].start),
        end: Number(current[current.length - 1].end),
        words: current,
        text: current.map((w) => w.word).join(" "),
      });

      current = [];
    }
  });

  return chunks;
}

function assTime(seconds) {
  const total = Math.max(0, Math.round(seconds * 100));
  const hours = Math.floor(total / 360000);
  const minutes = Math.floor((total % 360000) / 6000);
  const secs = Math.floor((total % 6000) / 100);

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(total % 100).padStart(2, "0")}`;
}

function assColor(hex) {
  const clean = hex.replace("#", "");
  const r = clean.slice(0, 2);
  const g = clean.slice(2, 4);
  const b = clean.slice(4, 6);

  return `&H00${b}${g}${r}`.toUpperCase();
}

function assBackground(hex) {
  const clean = hex.replace("#", "");
  const r = clean.slice(0, 2);
  const g = clean.slice(2, 4);
  const b = clean.slice(4, 6);

  return `&H55${b}${g}${r}`.toUpperCase();
}

function escapeAssText(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\r?\n/g, "\\N");
}

function buildAss({
  chunks,
  editedTexts,
  style,
  fontSize,
  captionPosition,
  captionBackground,
  captionOutline,
  fontWeight,
}) {
  const preset = STYLES[style] || STYLES.hormozi;
  const font = Math.round(fontSize * 2.2);
  const bold = Number(fontWeight) >= 600 ? -1 : 0;

  const alignment = {
    bottom: 2,
    top: 8,
    center: 5,
  }[captionPosition] || 2;

  const marginV = captionPosition === "top"
    ? 350
    : captionPosition === "center"
      ? 0
      : 320;

  const backgroundColor = assBackground(preset.bg);
  const primaryColor = style === "karaoke"
    ? assColor("#4ADE80")
    : assColor(preset.color);
  const secondaryColor = style === "karaoke"
    ? assColor("#FFFFFF")
    : primaryColor;

  const borderStyle = captionBackground ? 3 : 1;
  const outlineWidth = captionBackground
    ? 1
    : captionOutline
      ? 4
      : 0;

  const shadow = captionOutline ? 1 : 0;

  const header = `[Script Info]
Title: AutoSubly Captions
ScriptType: v4.00+
WrapStyle: 2
ScaledBorderAndShadow: yes
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,${font},${primaryColor},${secondaryColor},&H00000000,${backgroundColor},${bold},0,0,0,100,100,0,0,${borderStyle},${outlineWidth},${shadow},${alignment},60,60,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = chunks
    .filter((chunk) => chunk.end > chunk.start)
    .map((chunk) => {
      const edited = editedTexts[chunk.id];
      const text = String(edited ?? chunk.text).trim();

      if (!text) return "";

      let captionText;

      if (style === "karaoke") {
        const tokens = text.split(/\s+/);
        const originalWords = chunk.words;

        const durations = tokens.map((_, index) => {
          if (tokens.length === originalWords.length) {
            const word = originalWords[index];
            return Math.max(
              1,
              Math.round((Number(word.end) - Number(word.start)) * 100)
            );
          }

          return Math.max(
            1,
            Math.round(
              ((chunk.end - chunk.start) / tokens.length) * 100
            )
          );
        });

        captionText = tokens
          .map((word, index) => {
            return `{\\k${durations[index]}}${escapeAssText(word.toUpperCase())}`;
          })
          .join(" ");
      } else {
        captionText = escapeAssText(text.toUpperCase());
      }

      return `Dialogue: 0,${assTime(chunk.start)},${assTime(chunk.end)},Default,,0,0,0,,${captionText}`;
    })
    .filter(Boolean)
    .join("\n");

  return header + events + "\n";
}

function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    const process = spawn(ffmpegPath, args);
    let stderr = "";

    process.stderr.on("data", (data) => {
      stderr = (stderr + data.toString()).slice(-12000);
    });

    process.on("error", reject);

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || `FFmpeg exited with code ${code}`));
      }
    });
  });
}

export async function POST(request) {
  let tempDir;

  try {
    if (!ffmpegPath) {
      throw new Error("FFmpeg binary was not found.");
    }

    const form = await request.formData();

    const file = form.get("file");
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "Please upload a valid video file." },
        { status: 400 }
      );
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Video must be 25 MB or smaller." },
        { status: 413 }
      );
    }

    const words = JSON.parse(form.get("words") || "[]");
    const editedTexts = JSON.parse(form.get("editedTexts") || "{}");

    if (
      !Array.isArray(words) ||
      !words.length ||
      words.some((word) =>
        typeof word.word !== "string" ||
        !Number.isFinite(Number(word.start)) ||
        !Number.isFinite(Number(word.end)) ||
        Number(word.end) <= Number(word.start)
      )
    ) {
      return NextResponse.json(
        { error: "The word timestamps are invalid." },
        { status: 400 }
      );
    }

    const style = String(form.get("style") || "hormozi");
    const fontSize = Math.min(
      48,
      Math.max(18, Number(form.get("fontSize")) || 30)
    );
    const captionPosition = String(
      form.get("captionPosition") || "bottom"
    );
    const captionBackground = form.get("captionBackground") !== "false";
    const captionOutline = form.get("captionOutline") === "true";
    const fontWeight = String(form.get("fontWeight") || "900");

    if (!["hormozi", "karaoke", "mrbeast", "minimal"].includes(style)) {
      return NextResponse.json(
        { error: "Invalid caption style." },
        { status: 400 }
      );
    }

    tempDir = await mkdtemp(path.join(tmpdir(), "autosubly-"));

    const inputPath = path.join(tempDir, "input-video");
    const assPath = path.join(tempDir, "captions.ass");
    const outputPath = path.join(tempDir, "output.mp4");

    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    const chunks = makeChunks(words);

    const assContent = buildAss({
      chunks,
      editedTexts,
      style,
      fontSize,
      captionPosition,
      captionBackground,
      captionOutline,
      fontWeight,
    });

    await writeFile(assPath, assContent, "utf8");

    const escapedAssPath = assPath
      .replace(/\\/g, "\\\\")
      .replace(/:/g, "\\:")
      .replace(/'/g, "\\'")
      .replace(/,/g, "\\,");

    await runFFmpeg([
      "-y",
      "-i", inputPath,
      "-map", "0:v:0",
      "-map", "0:a?",
      "-vf", `ass=${escapedAssPath}`,
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "23",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "128k",
      "-threads", "2",
      "-movflags", "+faststart",
      outputPath,
    ]);

    const output = await readFile(outputPath);

    return new Response(output, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="autosubly-captioned.mp4"',
        "Content-Length": String(output.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("AutoSubly render error:", error);

    return NextResponse.json(
      {
        error: error.message?.startsWith("FFmpeg")
          ? error.message
          : "Video rendering failed. Please try again.",
      },
      { status: 500 }
    );
  } finally {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
