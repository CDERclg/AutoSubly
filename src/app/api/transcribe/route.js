
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MAX_SIZE = 25 * 1024 * 1024;

const ALLOWED_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export async function POST(req) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key is missing." },
        { status: 503 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Please upload a valid video." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported video format." },
        { status: 415 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Maximum file size is 25 MB." },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const upload = await toFile(buffer, file.name, {
      type: file.type,
    });

    const result = await groq.audio.transcriptions.create({
      file: upload,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
    });

    return NextResponse.json({
      success: true,
      transcript: result.text,
      words: result.words || [],
      duration: result.duration,
    });

  } catch (error) {
    console.error("Groq transcription error:", error);

    if (error.status === 429) {
      return NextResponse.json(
        { error: "Groq rate limit reached. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Transcription failed. Please try another video." },
      { status: error.status || 500 }
    );
  }
}
