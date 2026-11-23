
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2">
          <div className="bg-violet-600 p-2 rounded-lg">
            <Sparkles className="text-white" size={20} />
          </div>

          <span className="text-2xl font-bold tracking-tight">
            Auto<span className="text-violet-600">Subly</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-violet-600">
            Home
          </Link>

          <a href="#how-it-works" className="hover:text-violet-600">
            How it works
          </a>

          <a href="#features" className="hover:text-violet-600">
            Features
          </a>
        </div>

        <a
          href="#upload"
          className="bg-violet-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-violet-700 transition"
        >
          Generate Subtitles
        </a>

      </div>
    </nav>
  );
}
