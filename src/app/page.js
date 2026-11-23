
import Navbar from "@/components/Navbar";
import UploadSection from "@/components/UploadSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">

        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-6">
          <span>✦</span>
          Free AI-powered subtitle generator
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
          Free AI Subtitle Generator
          <span className="block text-violet-600 mt-2">
            For Every Video
          </span>
        </h1>

        <p className="max-w-2xl mx-auto mt-6 text-gray-500 text-base sm:text-lg">
          Automatically generate subtitles and captions for your
          videos. Customize your captions and download them easily.
        </p>

      </section>

      <UploadSection />

      <section
        id="how-it-works"
        className="max-w-5xl mx-auto px-6 py-16 text-center"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Create subtitles in minutes
        </h2>

        <p className="text-gray-500 mt-3">
          Upload your video, generate captions and customize them.
        </p>
      </section>

    </main>
  );
}
