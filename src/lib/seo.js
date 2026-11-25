export const SITE_URL = "https://autosubly.vercel.app"; // change to your custom domain later
export const SITE_NAME = "AutoSubly";
export const TITLE = "AutoSubly: Free AI Subtitle Generator & Auto Captions";
export const DESCRIPTION =
  "Upload any video and get accurate subtitles in seconds. Powered by AI that handles accents, background noise, and multiple speakers.";

export const HOME_FAQS = [
  { q: "Is AutoSubly really free?", a: "Yes. You can upload a video and generate subtitles for free. Heavy users can upgrade later for longer videos and more exports." },
  { q: "How accurate are the AI subtitles?", a: "AutoSubly uses speech recognition tuned for accents, background noise and several people talking. Most clear videos need only light edits, and you can fix any line before exporting." },
  { q: "Which subtitle formats can I download?", a: "You can export SRT and VTT files, or burn captions straight into the video." },
  { q: "Which languages are supported?", a: "AutoSubly can transcribe many popular languages and can translate subtitles into others. Check the tool for the current list." },
  { q: "Are my videos private?", a: "Your uploads are used only to create your subtitles. You can delete a video and its subtitles at any time." },
];

export const TOOL_PAGES = [
  {
    slug: "srt-generator",
    title: "Free SRT Generator: Video to SRT File | AutoSubly",
    description: "Create an SRT subtitle file from any video in seconds. Free AI SRT generator with accurate timing for YouTube, Vimeo and video editors.",
    h1: "Free SRT Generator for Any Video",
    intro: "An SRT file is the most widely supported subtitle format, and AutoSubly builds one for you automatically. Upload your video, let the AI listen, and download an SRT with timestamps already matched to the speech. It opens in YouTube, Premiere Pro, DaVinci Resolve, VLC and almost every other video tool.",
    steps: ["Upload your video file.", "Wait a few seconds while the AI transcribes it.", "Edit any line, then download the .srt file."],
    faqs: [
      { q: "What is an SRT file?", a: "SRT is a plain text file that stores subtitle lines with start and end times. Players read it to show text over your video." },
      { q: "Can I upload an SRT to YouTube?", a: "Yes. In YouTube Studio, open your video, choose Subtitles, and upload the file with timings." },
    ],
  },
  {
    slug: "video-to-text",
    title: "Video to Text Converter: AI Transcription | AutoSubly",
    description: "Turn any video into text with AI. Fast, accurate transcripts that handle accents, noise and multiple speakers. Start free.",
    h1: "Convert Video to Text with AI",
    intro: "Need a transcript of a lecture, interview, meeting or podcast video? AutoSubly converts speech to text in seconds and keeps the timing, so you can search it, quote it or turn it into subtitles later. It copes with accents, background noise and conversations between several speakers.",
    steps: ["Drop in your video.", "Let the AI transcribe the speech.", "Copy the text or export it with timestamps."],
    faqs: [
      { q: "Can it transcribe interviews with two speakers?", a: "Yes. The AI is built to handle multiple speakers in the same recording." },
      { q: "How long does transcription take?", a: "Most videos are done in seconds to a few minutes, depending on length." },
    ],
  },
  {
    slug: "auto-captions-for-youtube",
    title: "Auto Captions for YouTube Videos, Free | AutoSubly",
    description: "Generate accurate captions for YouTube videos in seconds. Fix YouTube's auto-captions, export SRT, and reach more viewers.",
    h1: "Auto Captions for YouTube Videos",
    intro: "YouTube's own auto-captions often miss names, accents and technical words. AutoSubly gives you cleaner captions you can review and upload yourself. Better captions help viewers who watch on mute, help people who are deaf or hard of hearing, and give search engines more text to understand your video.",
    steps: ["Upload the video you plan to publish.", "Review the AI captions and fix names or jargon.", "Upload the SRT in YouTube Studio under Subtitles."],
    faqs: [
      { q: "Do captions help YouTube SEO?", a: "Captions give search engines the exact words spoken in your video, which can help it match more searches." },
      { q: "Is this better than YouTube auto-captions?", a: "You can edit before publishing, so mistakes are fixed before viewers see them." },
    ],
  },
  {
    slug: "tiktok-captions-generator",
    title: "TikTok & Reels Captions Generator | AutoSubly",
    description: "Add auto captions to TikTok, Instagram Reels and YouTube Shorts. AI subtitles for short videos, ready in seconds.",
    h1: "Auto Captions Generator for TikTok and Reels",
    intro: "Most short videos are watched with the sound off, so captions decide whether people keep watching. AutoSubly listens to your clip, writes the captions and times them to the speech. Upload a vertical video and have captions ready before you post.",
    steps: ["Upload your vertical video.", "Let the AI write and time the captions.", "Download the subtitles or the captioned video."],
    faqs: [
      { q: "Does it work with vertical 9:16 video?", a: "Yes. Vertical clips from TikTok, Reels and Shorts work like any other video." },
      { q: "Can I change the caption text?", a: "Yes. Edit any line before you export." },
    ],
  },
  {
    slug: "mp4-subtitles",
    title: "Add Subtitles to MP4 Video Online | AutoSubly",
    description: "Add subtitles to MP4 videos online. AI writes the captions, you review and export. No software to install.",
    h1: "Add Subtitles to MP4 Videos Online",
    intro: "You don't need editing software to subtitle an MP4. Upload the file to AutoSubly, check the generated captions, and export them as a subtitle file or burn them into the video. It runs in your browser, so there is nothing to install.",
    steps: ["Upload your MP4.", "Check and edit the AI subtitles.", "Export the subtitle file or captioned video."],
    faqs: [
      { q: "What is the difference between soft and burned-in subtitles?", a: "Soft subtitles are a separate file viewers can turn on or off. Burned-in subtitles are part of the picture and always visible." },
      { q: "Do I need to install anything?", a: "No. AutoSubly works in your browser." },
    ],
  },
  {
    slug: "vtt-generator",
    title: "Free VTT Subtitle Generator for Video | AutoSubly",
    description: "Generate WebVTT (.vtt) subtitles from any video with AI. Works with HTML5 video players, Vimeo and web platforms.",
    h1: "Free VTT Subtitle Generator",
    intro: "WebVTT is the subtitle format built for the web, and the HTML5 video tag reads it natively. AutoSubly creates a VTT file from your video's speech so you can add captions to your own website or video player.",
    steps: ["Upload your video.", "Let the AI transcribe and time the speech.", "Download the .vtt file and attach it to your player."],
    faqs: [
      { q: "VTT or SRT: which should I use?", a: "Use VTT for websites and HTML5 players. Use SRT for YouTube and most editing software." },
      { q: "Can I add VTT to an HTML5 video?", a: "Yes, with a track element inside the video tag that points to your file." },
    ],
  },
];