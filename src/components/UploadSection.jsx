"use client";

import { useEffect, useRef, useState } from "react";
import CaptionEditor from "@/components/editor/CaptionEditor";
import {
  UploadCloud,
  Video,
  X,
  RefreshCw,
  FileVideo,
  CheckCircle2,
} from "lucide-react";

const MAX_SIZE = 25 * 1024 * 1024;

const ALLOWED_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export default function UploadSection() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [words, setWords] = useState([]);

  async function generateSubtitles() {
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Transcription failed.");

      setTranscript(data.transcript || "");
      // guard: the editor expects an array, never null/undefined
      setWords(Array.isArray(data.words) ? data.words : []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFile(selectedFile) {
    setError("");

    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError("Unsupported format. Please upload MP4, MOV or WebM.");
      return;
    }

    if (selectedFile.size > MAX_SIZE) {
      setError("File size must be below 25 MB.");
      return;
    }

    if (selectedFile.size === 0) {
      setError("This file is empty. Please choose another video.");
      return;
    }

    setTranscript("");
    setWords([]);
    setFile(selectedFile);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);

    handleFile(e.dataTransfer.files?.[0]);
  }

  function removeFile() {
    setFile(null);
    setTranscript("");
    setWords([]);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const formatSize = (bytes) =>
    `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return (
    <>
      {/* Upload card — narrow on purpose, styles unchanged */}
      <section id="upload" className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Upload your video
          </h2>

          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Turn your video into caption-ready content with AI.
          </p>
        </div>

        {!file ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-7 sm:p-12 text-center transition-all duration-200
              ${
                dragging
                  ? "border-violet-600 bg-violet-50 scale-[1.01]"
                  : "border-gray-300 bg-white hover:border-violet-400"
              }`}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-violet-100 flex items-center justify-center">
              <UploadCloud className="text-violet-600" size={36} />
            </div>

            <h3 className="mt-5 text-lg sm:text-xl font-semibold text-gray-900">
              Drag and drop your video here
            </h3>

            <p className="text-gray-500 text-sm mt-2">
              or select a video from your device
            </p>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition w-full sm:w-auto"
            >
              <Video size={18} />
              Choose video
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            <div className="mt-7 flex flex-wrap justify-center gap-2 text-xs text-gray-500">
              <span className="bg-gray-100 rounded-md px-3 py-1.5">MP4</span>
              <span className="bg-gray-100 rounded-md px-3 py-1.5">MOV</span>
              <span className="bg-gray-100 rounded-md px-3 py-1.5">WEBM</span>
              <span className="bg-gray-100 rounded-md px-3 py-1.5">MAX 25 MB</span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">

            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-violet-100 p-3 rounded-xl shrink-0">
                  <FileVideo className="text-violet-600" size={22} />
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>

              <CheckCircle2 className="text-green-500 shrink-0" size={22} />
            </div>

            {/* <div className="rounded-xl overflow-hidden bg-black">
              {preview && (
                <video
                  src={preview}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full max-h-[420px] object-contain"
                />
              )}
            </div> */}

            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <button
                type="button"
                onClick={removeFile}
                className="flex-1 flex justify-center cursor-pointer items-center gap-2 border border-gray-300 text-gray-700 rounded-xl py-3 font-medium hover:bg-gray-50 transition"
              >
                <X size={17} />
                Remove video
              </button>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex-1 flex justify-center cursor-pointer items-center gap-2 bg-violet-600 text-white rounded-xl py-3 font-semibold hover:bg-violet-700 transition"
              >
                <RefreshCw size={17} />
                Replace video
              </button>
            </div>

            <button
              type="button"
              onClick={generateSubtitles}
              disabled={loading || !file}
              className="mt-5 w-full bg-violet-600 hover:bg-violet-700
              text-white font-semibold py-4 rounded-xl cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating subtitles..." : "Continue to Generate Subtitles →"}
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <p className="text-center text-xs text-gray-400 mt-4">
          Your video is only previewed in your browser at this stage.
        </p>
      </section>

      {/* Editor lives OUTSIDE the max-w-3xl section so its 90vw width actually works */}
      {transcript && (
        <CaptionEditor
          file={file}
          words={words}
          transcript={transcript}
        />
      )}
    </>
  );
}