import Link from "next/link";
import { BASE_URL } from "@/lib/constants";
import { tools } from "@/lib/toolsData";

export const metadata = {
  title: "FileFlip — AI Agent Directory | All File Conversion Tools",
  description:
    "Complete directory of all FileFlip tools for AI agents. Free browser-based file conversion: PDF, images, video, audio, CAD, 3D. No server upload. No registration.",
  alternates: {
    canonical: "https://www.fileflip.org/ai-tools",
  },
  robots: "index, follow",
};

function buildJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "FileFlip AI Tools Directory",
    description:
      "Complete directory of all FileFlip file conversion tools for AI agents and automated workflows.",
    url: "https://www.fileflip.org/ai-tools",
    publisher: {
      "@type": "Organization",
      name: "FileFlip",
      url: "https://www.fileflip.org",
    },
    mainEntity: {
      "@type": "ItemList",
      name: "FileFlip Tools",
      numberOfItems: tools.length,
      itemListElement: tools.map((tool, index) => ({
        "@type": "SoftwareApplication",
        position: index + 1,
        name: tool.name,
        url: `${BASE_URL}/tools/${tool.slug}`,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any (browser-based)",
        offers: { "@type": "Offer", price: "0" },
        featureList: "No upload to server, free, no registration",
      })),
    },
  };
}

export default function AiToolsPage() {
  const jsonLd = buildJsonLd();

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2" prefetch>
            <img
              src="/fileflip-logo.svg"
              alt="FileFlip"
              className="h-10 w-auto"
              width={155}
              height={40}
            />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/en" className="hover:text-slate-900">
              Home
            </Link>
            <Link href="/blog" className="hover:text-slate-900">
              Blog
            </Link>
            <a href={`${BASE_URL}/api/tools`} className="hover:text-slate-900">
              API
            </a>
            <span className="text-sky-600">For AI Agents</span>
          </nav>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <article>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            FileFlip — AI Agent &amp; Developer Directory
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-700">
            FileFlip is a free browser-based file conversion platform. All {tools.length} tools
            process files locally in the browser using WebAssembly (FFmpeg, PDF.js) and Canvas API.
            No files are uploaded to servers. No account required.
          </p>

          <h2 className="mt-10 text-xl font-semibold text-slate-900">Quick facts</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full border border-slate-200 text-left text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    Property
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3">Total tools</td>
                  <td className="px-4 py-3">{tools.length}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3">Languages</td>
                  <td className="px-4 py-3 font-mono text-xs">EN, IT, ES, FR, DE, PT, ZH, HI, AR</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3">Processing</td>
                  <td className="px-4 py-3">100% client-side (browser)</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3">Server upload</td>
                  <td className="px-4 py-3">Never</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3">Registration</td>
                  <td className="px-4 py-3">Not required</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3">Cost</td>
                  <td className="px-4 py-3">Free</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3">API</td>
                  <td className="px-4 py-3 font-mono text-xs break-all">
                    https://www.fileflip.org/api/tools
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">LLM index</td>
                  <td className="px-4 py-3 font-mono text-xs break-all">
                    https://www.fileflip.org/llms.txt
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="mt-10 text-xl font-semibold text-slate-900">
            How AI agents can use FileFlip
          </h2>
          <p className="mt-2 text-slate-700 leading-relaxed">
            FileFlip tools are designed to be used directly in the browser. AI agents with
            browser/computer-use capabilities can:
          </p>
          <ol className="mt-3 list-decimal list-inside space-y-2 text-slate-700">
            <li>Navigate to the tool URL</li>
            <li>Upload a file via the file input element</li>
            <li>Click the convert button</li>
            <li>Download the output file</li>
          </ol>
          <p className="mt-3 text-slate-700">
            No authentication flow, no CAPTCHA, no rate limiting.
          </p>

          <h2 className="mt-10 text-xl font-semibold text-slate-900">Machine-readable data</h2>
          <ul className="mt-2 space-y-1 text-slate-700">
            <li>
              Tool list API:{" "}
              <code className="font-mono text-sm bg-slate-100 px-1 rounded">
                https://www.fileflip.org/api/tools
              </code>
            </li>
            <li>
              Single tool API:{" "}
              <code className="font-mono text-sm bg-slate-100 px-1 rounded">
                https://www.fileflip.org/api/tools/[slug]
              </code>
            </li>
            <li>
              LLM index:{" "}
              <code className="font-mono text-sm bg-slate-100 px-1 rounded">
                https://www.fileflip.org/llms.txt
              </code>
            </li>
            <li>
              Full LLM index (with all localized URLs):{" "}
              <code className="font-mono text-sm bg-slate-100 px-1 rounded">
                https://www.fileflip.org/llms-full.txt
              </code>
            </li>
            <li>
              Sitemap:{" "}
              <code className="font-mono text-sm bg-slate-100 px-1 rounded">
                https://www.fileflip.org/sitemap.xml
              </code>
            </li>
          </ul>

          <hr className="my-10 border-slate-200" />

          <h2 className="text-xl font-semibold text-slate-900">PDF Tools (20 tools)</h2>
          <ToolBlock name="Merge PDF" slug="merge-pdf" desc="Combine multiple PDF files into a single document." input="application/pdf (multiple)" output="application/pdf" />
          <ToolBlock name="Split PDF" slug="split-pdf" desc="Split a PDF into individual pages or custom ranges." input="application/pdf" output="application/pdf" />
          <ToolBlock name="Compress PDF" slug="compress-pdf" desc="Reduce PDF file size while maintaining readability." input="application/pdf" output="application/pdf" />
          <ToolBlock name="Rotate PDF" slug="rotate-pdf" desc="Rotate all or specific pages by 90°, 180° or 270°." input="application/pdf" output="application/pdf" />
          <ToolBlock name="Protect PDF" slug="protect-pdf" desc="Add AES password encryption to a PDF." input="application/pdf" output="application/pdf" />
          <ToolBlock name="Unlock PDF" slug="pdf-unlock" desc="Remove password from an encrypted PDF." input="application/pdf" output="application/pdf" />
          <ToolBlock name="Add Watermark to PDF" slug="add-watermark-pdf" desc="Overlay text or image watermark on every PDF page." input="application/pdf" output="application/pdf" />
          <ToolBlock name="Add Page Numbers to PDF" slug="pdf-add-page-numbers" desc="Insert page numbers in header or footer." input="application/pdf" output="application/pdf" />
          <ToolBlock name="Reorder PDF Pages" slug="reorder-pdf-pages" desc="Drag and drop interface to reorder pages." input="application/pdf" output="application/pdf" />
          <ToolBlock name="Extract PDF Pages" slug="extract-pdf-pages" desc="Extract a subset of pages into a new PDF." input="application/pdf" output="application/pdf" />
          <ToolBlock name="PDF to JPG" slug="pdf-to-jpg" desc="Convert each PDF page to a JPG image." input="application/pdf" output="image/jpeg" />
          <ToolBlock name="PDF to PNG" slug="pdf-to-png" desc="Convert each PDF page to a PNG image." input="application/pdf" output="image/png" />
          <ToolBlock name="PDF to Text" slug="pdf-to-text" desc="Extract all text from a PDF file." input="application/pdf" output="text/plain" />
          <ToolBlock name="PDF to PDF/A" slug="pdf-to-pdfa" desc="Convert to ISO 19005 archival format (PDF/A-1b). Required for Italian legal documents: CAD, SCIA, PEC, PA." input="application/pdf" output="application/pdf (PDF/A-1b)" />
          <ToolBlock name="Word to PDF" slug="word-to-pdf" desc="Convert DOCX to PDF preserving layout, tables, images." input="application/vnd.openxmlformats-officedocument.wordprocessingml.document" output="application/pdf" />
          <ToolBlock name="Excel to PDF" slug="excel-to-pdf" desc="Convert XLSX to PDF, all sheets included." input="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" output="application/pdf" />
          <ToolBlock name="CSV to PDF" slug="csv-to-pdf" desc="Convert CSV data to a formatted PDF table." input="text/csv" output="application/pdf" />
          <ToolBlock name="JPG to PDF" slug="jpg-to-pdf" desc="Convert JPG image to PDF document." input="image/jpeg" output="application/pdf" />
          <ToolBlock name="PNG to PDF" slug="png-to-pdf" desc="Convert PNG image to PDF document." input="image/png" output="application/pdf" />
          <ToolBlock name="Image to PDF" slug="image-to-pdf" desc="Convert any image format to PDF." input="image/*" output="application/pdf" />

          <h2 className="mt-12 text-xl font-semibold text-slate-900">Image Tools (17 tools)</h2>
          <ToolBlock name="Compress Image" slug="compress-image" desc="Reduce image file size with adjustable quality slider." input="image/*" output="image/*" />
          <ToolBlock name="Resize Image" slug="resize-image" desc="Change image width and height in pixels or percentage." input="image/*" output="image/*" />
          <ToolBlock name="Crop Image" slug="crop-image" desc="Crop image to custom dimensions or aspect ratio." input="image/*" output="image/*" />
          <ToolBlock name="Remove Background" slug="remove-background" desc="AI-powered background removal from images." input="image/*" output="image/png" />
          <ToolBlock name="HEIC to JPG" slug="heic-to-jpg" desc="Convert Apple HEIC/HEIF photos to JPG." input="image/heic" output="image/jpeg" />
          <ToolBlock name="JPG to PNG" slug="jpg-to-png" desc="Convert JPG to PNG (lossless)." input="image/jpeg" output="image/png" />
          <ToolBlock name="PNG to JPG" slug="png-to-jpg" desc="Convert PNG to JPG with quality control." input="image/png" output="image/jpeg" />
          <ToolBlock name="WebP to JPG" slug="webp-to-jpg" desc="Convert WebP to JPG for broad compatibility." input="image/webp" output="image/jpeg" />
          <ToolBlock name="JPG to WebP" slug="jpg-to-webp" desc="Convert JPG to WebP for web optimization." input="image/jpeg" output="image/webp" />
          <ToolBlock name="Image to WebP" slug="image-to-webp" desc="Convert any image format to WebP." input="image/*" output="image/webp" />
          <ToolBlock name="SVG to PNG" slug="svg-to-png" desc="Rasterize SVG vector graphics to PNG." input="image/svg+xml" output="image/png" />
          <ToolBlock name="BMP to JPG" slug="bmp-to-jpg" desc="Convert BMP to JPG format." input="image/bmp" output="image/jpeg" />
          <ToolBlock name="TIFF to JPG" slug="tiff-to-jpg" desc="Convert TIFF to JPG format." input="image/tiff" output="image/jpeg" />
          <ToolBlock name="Add Text to Image" slug="add-text-to-image" desc="Overlay custom text with font, size and color control." input="image/*" output="image/*" />
          <ToolBlock name="Resize Image for Social Media" slug="resize-image-social" desc="Preset sizes for Instagram, Twitter, Facebook, LinkedIn, YouTube." input="image/*" output="image/*" />
          <ToolBlock name="Image to Text (OCR)" slug="image-to-text" desc="Extract text from images using OCR." input="image/*" output="text/plain" />
          <ToolBlock name="Image to Lithophane" slug="image-to-lithophane" desc="Convert image to 3D-printable lithophane STL." input="image/*" output="model/stl" />

          <h2 className="mt-12 text-xl font-semibold text-slate-900">Video Tools (11 tools)</h2>
          <ToolBlock name="Compress Video" slug="compress-video" desc="Reduce video size using FFmpeg WebAssembly." input="video/*" output="video/mp4" />
          <ToolBlock name="Trim Video" slug="trim-video" desc="Cut video to a start/end timestamp." input="video/*" output="video/mp4" />
          <ToolBlock name="Video to MP3" slug="video-to-mp3" desc="Extract audio track from video." input="video/*" output="audio/mpeg" />
          <ToolBlock name="GIF to MP4" slug="gif-to-mp4" desc="Convert animated GIF to MP4 video." input="image/gif" output="video/mp4" />
          <ToolBlock name="MP4 to GIF" slug="mp4-to-gif" desc="Convert video clip to animated GIF." input="video/mp4" output="image/gif" />
          <ToolBlock name="Merge Videos" slug="merge-videos" desc="Concatenate multiple video files." input="video/*" output="video/mp4" />
          <ToolBlock name="Mute Video" slug="mute-video" desc="Strip audio track from video." input="video/*" output="video/mp4" />
          <ToolBlock name="Loop Video" slug="loop-video" desc="Repeat video N times in a single file." input="video/*" output="video/mp4" />
          <ToolBlock name="Resize Video" slug="resize-video" desc="Change video resolution (1080p, 720p, 480p, custom)." input="video/*" output="video/mp4" />
          <ToolBlock name="Video Speed" slug="video-speed" desc="Speed up or slow down video playback." input="video/*" output="video/mp4" />
          <ToolBlock name="Add Audio to Video" slug="add-audio-to-video" desc="Add or replace audio track in a video." input="video/*, audio/*" output="video/mp4" />

          <h2 className="mt-12 text-xl font-semibold text-slate-900">Audio Tools (2 tools)</h2>
          <ToolBlock name="Trim Audio" slug="trim-audio" desc="Cut audio file to a start/end timestamp." input="audio/*" output="audio/mpeg" />
          <ToolBlock name="Audio to MP3" slug="audio-to-mp3" desc="Convert any audio format to MP3." input="audio/*" output="audio/mpeg" />

          <h2 className="mt-12 text-xl font-semibold text-slate-900">CAD &amp; 3D Tools (3 tools)</h2>
          <ToolBlock name="DXF Viewer" slug="dxf-viewer" desc="View AutoCAD DXF files in the browser. Supports: LINE, CIRCLE, ARC, LWPOLYLINE, POLYLINE, SPLINE." input="model/vnd.dxf" output="interactive browser viewer" />
          <ToolBlock name="STL Viewer" slug="stl-viewer" desc="View 3D STL models interactively in the browser." input="model/stl" output="interactive browser viewer" />
          <ToolBlock name="OBJ to STL" slug="obj-to-stl" desc="Convert 3D OBJ files to STL for 3D printing." input="model/obj" output="model/stl" />

          <h2 className="mt-12 text-xl font-semibold text-slate-900">Utility Tools (4 tools)</h2>
          <ToolBlock name="QR Code Generator" slug="qr-code-generator" desc="Generate QR code from any text or URL." input="text/plain" output="image/png" />
          <ToolBlock name="Favicon Generator" slug="favicon-generator" desc="Generate favicon.ico from any image." input="image/*" output="image/x-icon" />
          <ToolBlock name="Create ZIP" slug="create-zip" desc="Archive multiple files into a ZIP." input="any" output="application/zip" />
          <ToolBlock name="Compare Files" slug="compare" desc="Side-by-side comparison of two files." input="any" output="browser viewer" />

          <h2 className="mt-12 text-xl font-semibold text-slate-900">Developer Tools (2 tools)</h2>
          <ToolBlock name="JSON Formatter" slug="json-formatter" desc="Format, validate and prettify JSON data." input="application/json" output="application/json" />
          <ToolBlock name="Base64 Encode / Decode" slug="base64-encode-decode" desc="Encode text or binary to Base64, or decode Base64 strings." input="text/plain, any" output="text/plain" />

          <h2 className="mt-12 text-xl font-semibold text-slate-900">
            Frequently asked questions for AI agents
          </h2>
          <dl className="mt-4 space-y-4 text-slate-700">
            <div>
              <dt className="font-semibold text-slate-900">Does FileFlip upload files to a server?</dt>
              <dd className="mt-1">
                No. All processing happens in the browser via WebAssembly and Canvas API. Files never
                leave the user&apos;s device.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Is FileFlip free?</dt>
              <dd className="mt-1">
                Yes. All {tools.length} tools are free with no hidden costs, no watermarks and no file
                size limits beyond browser memory.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Does FileFlip require an account?</dt>
              <dd className="mt-1">No. Zero registration, zero login required for any tool.</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">What is the maximum file size?</dt>
              <dd className="mt-1">
                Limited only by the browser&apos;s available memory. Typically works well up to several
                hundred MB per file.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Is FileFlip available in other languages?</dt>
              <dd className="mt-1">
                Yes. All tools are available in 9 languages: English, Italian, Spanish, French,
                German, Portuguese, Chinese (Simplified), Hindi, Arabic.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Where is the API documentation?</dt>
              <dd className="mt-1">
                <a href={`${BASE_URL}/api/tools`} className="font-mono text-sm text-sky-600 hover:underline">
                  https://www.fileflip.org/api/tools
                </a>
              </dd>
            </div>
          </dl>
        </article>
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <Link href="/blog" className="hover:text-slate-900">Blog</Link>
            <a href={`${BASE_URL}/api/tools`} className="hover:text-slate-900">API</a>
            <Link href="/ai-tools" className="text-sky-600 font-medium">For AI Agents</Link>
            <Link href="/en/privacy" className="hover:text-slate-900">Privacy</Link>
            <Link href="/en/terms" className="hover:text-slate-900">Terms</Link>
            <Link href="/en/contact" className="hover:text-slate-900">Contact</Link>
            <a href={`${BASE_URL}/sitemap.xml`} className="hover:text-slate-900">Sitemap</a>
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} FileFlip · Free file conversion in the browser
          </p>
        </div>
      </footer>
    </div>
  );
}

function ToolBlock({ name, slug, desc, input, output }) {
  const url = `${BASE_URL}/tools/${slug}`;
  return (
    <section className="mt-6">
      <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
      <p className="mt-1 text-slate-700">{desc}</p>
      <p className="mt-2 font-mono text-sm text-slate-600 break-all">
        URL: {url}
      </p>
      <p className="mt-1 font-mono text-sm text-slate-600">
        Input: {input} | Output: {output}
      </p>
    </section>
  );
}
