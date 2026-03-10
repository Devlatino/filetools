/**
 * Canonical list of FileFlip tools for the public API.
 * Used by GET /api/tools and GET /api/tools/[slug].
 */
const TOOLS_LIST = [
  // PDF
  { slug: "merge-pdf", name: "Merge PDF", description: "Combine multiple PDF files into one", category: "PDF", input: ["application/pdf"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["Combine reports", "Merge scanned documents", "Create single PDF from multiple files"] },
  { slug: "split-pdf", name: "Split PDF", description: "Split PDF into pages", category: "PDF", input: ["application/pdf"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["Extract single page", "Split by page range", "Create separate PDFs per page"] },
  { slug: "compress-pdf", name: "Compress PDF", description: "Reduce PDF file size", category: "PDF", input: ["application/pdf"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["Reduce PDF size for email attachment", "Compress PDF before uploading to web", "Optimize PDF for mobile viewing"] },
  { slug: "rotate-pdf", name: "Rotate PDF", description: "Rotate PDF pages", category: "PDF", input: ["application/pdf"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["Fix orientation of scanned pages", "Rotate landscape to portrait"] },
  { slug: "protect-pdf", name: "Protect PDF", description: "Add password to PDF", category: "PDF", input: ["application/pdf"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["Password-protect sensitive documents", "Restrict printing or copying"] },
  { slug: "pdf-unlock", name: "Unlock PDF", description: "Remove PDF password", category: "PDF", input: ["application/pdf"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["Remove password when you have it", "Unlock PDF for editing"] },
  { slug: "add-watermark-pdf", name: "Add Watermark", description: "Add watermark to PDF", category: "PDF", input: ["application/pdf"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["Add draft or confidential stamp", "Brand documents with logo"] },
  { slug: "pdf-add-page-numbers", name: "Add Page Numbers", description: "Add page numbers to PDF", category: "PDF", input: ["application/pdf"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["Number pages for printing", "Add footer page numbers"] },
  { slug: "reorder-pdf-pages", name: "Reorder Pages", description: "Reorder PDF pages", category: "PDF", input: ["application/pdf"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["Reorder scanned pages", "Rearrange document sections"] },
  { slug: "extract-pdf-pages", name: "Extract Pages", description: "Extract specific pages from PDF", category: "PDF", input: ["application/pdf"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["Extract one or more pages", "Create PDF from selected pages"] },
  { slug: "pdf-to-jpg", name: "PDF to JPG", description: "Convert PDF pages to JPG images", category: "PDF", input: ["application/pdf"], output: ["image/jpeg"], free: true, serverUpload: false, useCases: ["Share PDF page as image", "Use PDF page in presentations"] },
  { slug: "pdf-to-png", name: "PDF to PNG", description: "Convert PDF pages to PNG images", category: "PDF", input: ["application/pdf"], output: ["image/png"], free: true, serverUpload: false, useCases: ["Export PDF page with transparency", "Use in design software"] },
  { slug: "pdf-to-text", name: "PDF to Text", description: "Extract text from PDF", category: "PDF", input: ["application/pdf"], output: ["text/plain"], free: true, serverUpload: false, useCases: ["Copy text from PDF", "Search in PDF content"] },
  { slug: "pdf-to-pdfa", name: "PDF to PDF/A", description: "Convert PDF to archival PDF/A format", category: "PDF", input: ["application/pdf"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["Meet archival requirements", "Submit to public administration"] },
  { slug: "word-to-pdf", name: "Word to PDF", description: "Convert DOCX to PDF", category: "PDF", input: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["Share document as PDF", "Print-ready format"] },
  { slug: "excel-to-pdf", name: "Excel to PDF", description: "Convert XLSX to PDF", category: "PDF", input: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["Share spreadsheet as PDF", "Archive tables"] },
  { slug: "csv-to-pdf", name: "CSV to PDF", description: "Convert CSV to PDF table", category: "PDF", input: ["text/csv"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["Print CSV data", "Share table as PDF"] },
  { slug: "jpg-to-pdf", name: "JPG to PDF", description: "Convert JPG to PDF", category: "PDF", input: ["image/jpeg"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["Create PDF from photos", "Combine images into PDF"] },
  { slug: "png-to-pdf", name: "PNG to PDF", description: "Convert PNG to PDF", category: "PDF", input: ["image/png"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["Convert screenshot to PDF", "Image to document"] },
  { slug: "image-to-pdf", name: "Image to PDF", description: "Convert any image to PDF", category: "PDF", input: ["image/*"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["Scan to PDF", "Multiple images to one PDF"] },
  // IMAGE
  { slug: "compress-image", name: "Compress Image", description: "Reduce image file size", category: "IMAGE", input: ["image/*"], output: ["image/*"], free: true, serverUpload: false, useCases: ["Reduce size for web", "Fit email limits"] },
  { slug: "resize-image", name: "Resize Image", description: "Change image dimensions", category: "IMAGE", input: ["image/*"], output: ["image/*"], free: true, serverUpload: false, useCases: ["Resize for social media", "Reduce resolution"] },
  { slug: "crop-image", name: "Crop Image", description: "Crop image to custom size", category: "IMAGE", input: ["image/*"], output: ["image/*"], free: true, serverUpload: false, useCases: ["Remove borders", "Focus on region"] },
  { slug: "remove-background", name: "Remove Background", description: "Remove image background", category: "IMAGE", input: ["image/*"], output: ["image/png"], free: true, serverUpload: false, useCases: ["Product photos", "Profile pictures"] },
  { slug: "heic-to-jpg", name: "HEIC to JPG", description: "Convert iPhone HEIC to JPG", category: "IMAGE", input: ["image/heic"], output: ["image/jpeg"], free: true, serverUpload: false, useCases: ["Use iPhone photos on PC", "Share HEIC as JPG"] },
  { slug: "jpg-to-png", name: "JPG to PNG", description: "Convert JPG to PNG", category: "IMAGE", input: ["image/jpeg"], output: ["image/png"], free: true, serverUpload: false, useCases: ["Need transparency", "Lossless format"] },
  { slug: "png-to-jpg", name: "PNG to JPG", description: "Convert PNG to JPG", category: "IMAGE", input: ["image/png"], output: ["image/jpeg"], free: true, serverUpload: false, useCases: ["Smaller file size", "Compatibility"] },
  { slug: "webp-to-jpg", name: "WebP to JPG", description: "Convert WebP to JPG", category: "IMAGE", input: ["image/webp"], output: ["image/jpeg"], free: true, serverUpload: false, useCases: ["Legacy compatibility", "Edit in older software"] },
  { slug: "jpg-to-webp", name: "JPG to WebP", description: "Convert JPG to WebP", category: "IMAGE", input: ["image/jpeg"], output: ["image/webp"], free: true, serverUpload: false, useCases: ["Smaller size for web", "Modern format"] },
  { slug: "image-to-webp", name: "Image to WebP", description: "Convert any image to WebP", category: "IMAGE", input: ["image/*"], output: ["image/webp"], free: true, serverUpload: false, useCases: ["Optimize for web", "Convert screenshots"] },
  { slug: "svg-to-png", name: "SVG to PNG", description: "Convert SVG to PNG", category: "IMAGE", input: ["image/svg+xml"], output: ["image/png"], free: true, serverUpload: false, useCases: ["Rasterize vector", "Use in non-SVG contexts"] },
  { slug: "bmp-to-jpg", name: "BMP to JPG", description: "Convert BMP to JPG", category: "IMAGE", input: ["image/bmp"], output: ["image/jpeg"], free: true, serverUpload: false, useCases: ["Reduce file size", "Web compatibility"] },
  { slug: "tiff-to-jpg", name: "TIFF to JPG", description: "Convert TIFF to JPG", category: "IMAGE", input: ["image/tiff"], output: ["image/jpeg"], free: true, serverUpload: false, useCases: ["Smaller size", "Share scanned documents"] },
  { slug: "add-text-to-image", name: "Add Text to Image", description: "Overlay text on image", category: "IMAGE", input: ["image/*"], output: ["image/*"], free: true, serverUpload: false, useCases: ["Add captions", "Watermark images"] },
  { slug: "resize-image-social", name: "Resize for Social", description: "Resize for social media", category: "IMAGE", input: ["image/*"], output: ["image/*"], free: true, serverUpload: false, useCases: ["Instagram, LinkedIn dimensions", "Profile headers"] },
  { slug: "image-to-text", name: "Image to Text", description: "Extract text via OCR", category: "IMAGE", input: ["image/*"], output: ["text/plain"], free: true, serverUpload: false, useCases: ["Scan to text", "Extract from screenshot"] },
  { slug: "image-to-lithophane", name: "Image to Lithophane", description: "Convert to 3D lithophane STL", category: "IMAGE", input: ["image/*"], output: ["model/stl"], free: true, serverUpload: false, useCases: ["3D print photo", "Create lithophane model"] },
  // VIDEO
  { slug: "compress-video", name: "Compress Video", description: "Reduce video file size", category: "VIDEO", input: ["video/*"], output: ["video/mp4"], free: true, serverUpload: false, useCases: ["Fit size limits", "Faster uploads"] },
  { slug: "trim-video", name: "Trim Video", description: "Cut video duration", category: "VIDEO", input: ["video/*"], output: ["video/mp4"], free: true, serverUpload: false, useCases: ["Remove start/end", "Extract clip"] },
  { slug: "video-to-mp3", name: "Video to MP3", description: "Extract audio from video", category: "VIDEO", input: ["video/*"], output: ["audio/mpeg"], free: true, serverUpload: false, useCases: ["Extract music", "Podcast from video"] },
  { slug: "gif-to-mp4", name: "GIF to MP4", description: "Convert GIF to MP4", category: "VIDEO", input: ["image/gif"], output: ["video/mp4"], free: true, serverUpload: false, useCases: ["Smaller file", "Better compatibility"] },
  { slug: "mp4-to-gif", name: "MP4 to GIF", description: "Convert video to GIF", category: "VIDEO", input: ["video/mp4"], output: ["image/gif"], free: true, serverUpload: false, useCases: ["Reaction GIF", "Short loop"] },
  { slug: "merge-videos", name: "Merge Videos", description: "Combine multiple videos", category: "VIDEO", input: ["video/*"], output: ["video/mp4"], free: true, serverUpload: false, useCases: ["Concatenate clips", "Single file from parts"] },
  { slug: "mute-video", name: "Mute Video", description: "Remove audio from video", category: "VIDEO", input: ["video/*"], output: ["video/mp4"], free: true, serverUpload: false, useCases: ["Silent video", "Remove background noise track"] },
  { slug: "loop-video", name: "Loop Video", description: "Make video loop N times", category: "VIDEO", input: ["video/*"], output: ["video/mp4"], free: true, serverUpload: false, useCases: ["Repeating clip", "Seamless loop"] },
  { slug: "resize-video", name: "Resize Video", description: "Change video resolution", category: "VIDEO", input: ["video/*"], output: ["video/mp4"], free: true, serverUpload: false, useCases: ["Reduce resolution", "Fit aspect ratio"] },
  { slug: "video-speed", name: "Video Speed", description: "Change video speed", category: "VIDEO", input: ["video/*"], output: ["video/mp4"], free: true, serverUpload: false, useCases: ["Slow motion", "Time-lapse"] },
  { slug: "add-audio-to-video", name: "Add Audio", description: "Add audio track to video", category: "VIDEO", input: ["video/*", "audio/*"], output: ["video/mp4"], free: true, serverUpload: false, useCases: ["Add music", "Replace audio track"] },
  // AUDIO
  { slug: "trim-audio", name: "Trim Audio", description: "Cut audio duration", category: "AUDIO", input: ["audio/*"], output: ["audio/mpeg"], free: true, serverUpload: false, useCases: ["Trim silence", "Extract segment"] },
  { slug: "audio-to-mp3", name: "Audio to MP3", description: "Convert audio to MP3", category: "AUDIO", input: ["audio/*"], output: ["audio/mpeg"], free: true, serverUpload: false, useCases: ["Convert WAV/FLAC to MP3", "Universal format"] },
  // CAD & 3D
  { slug: "dxf-viewer", name: "DXF Viewer", description: "View AutoCAD DXF files", category: "CAD & 3D", input: ["model/vnd.dxf", "application/dxf"], output: ["viewer"], free: true, serverUpload: false, useCases: ["Preview DXF", "View CAD drawings"] },
  { slug: "stl-viewer", name: "STL Viewer", description: "View 3D STL files", category: "CAD & 3D", input: ["model/stl", "application/sla"], output: ["viewer"], free: true, serverUpload: false, useCases: ["Preview STL", "Check 3D model"] },
  { slug: "obj-to-stl", name: "OBJ to STL", description: "Convert OBJ to STL", category: "CAD & 3D", input: ["model/obj"], output: ["model/stl"], free: true, serverUpload: false, useCases: ["3D print OBJ", "STL for slicing"] },
  // UTILITY
  { slug: "qr-code-generator", name: "QR Code Generator", description: "Generate QR code", category: "UTILITY", input: ["text/plain"], output: ["image/png"], free: true, serverUpload: false, useCases: ["Link to URL", "Encode text"] },
  { slug: "favicon-generator", name: "Favicon Generator", description: "Generate favicon", category: "UTILITY", input: ["image/*"], output: ["image/x-icon"], free: true, serverUpload: false, useCases: ["Website favicon", "App icon sizes"] },
  { slug: "create-zip", name: "Create ZIP", description: "Compress files to ZIP", category: "UTILITY", input: ["*"], output: ["application/zip"], free: true, serverUpload: false, useCases: ["Bundle files", "Reduce size for transfer"] },
  { slug: "compare", name: "Compare Files", description: "Compare two files", category: "UTILITY", input: ["*"], output: ["viewer"], free: true, serverUpload: false, useCases: ["Diff two PDFs", "Compare documents"] },
  { slug: "unit-converter", name: "Unit Converter", description: "Convert length, weight, temperature, area, volume, speed and data units", category: "UTILITY", input: ["text"], output: ["text"], free: true, serverUpload: false, useCases: ["Length, weight, temperature", "Cooking measures", "Data storage"] },
  // DEVELOPER
  { slug: "json-formatter", name: "JSON Formatter", description: "Format and validate JSON", category: "DEVELOPER", input: ["application/json"], output: ["application/json"], free: true, serverUpload: false, useCases: ["Pretty-print JSON", "Validate API response"] },
  { slug: "base64-encode-decode", name: "Base64 Encode/Decode", description: "Encode or decode Base64", category: "DEVELOPER", input: ["text/plain"], output: ["text/plain"], free: true, serverUpload: false, useCases: ["Encode for data URI", "Decode API payload"] },
  { slug: "password-generator", name: "Password Generator", description: "Generate strong, secure random passwords", category: "DEVELOPER", input: ["text"], output: ["text"], free: true, serverUpload: false, useCases: ["Secure account passwords", "Random PIN", "API keys"] },
  { slug: "markdown-to-pdf", name: "Markdown to PDF", description: "Convert Markdown documents to PDF with live preview", category: "DEVELOPER", input: ["text/markdown"], output: ["application/pdf"], free: true, serverUpload: false, useCases: ["README to PDF", "Docs to PDF", "Notes to PDF"] },
];

const CATEGORY_ORDER = ["PDF", "IMAGE", "VIDEO", "AUDIO", "CAD & 3D", "UTILITY", "DEVELOPER"];

/** All tools as array (canonical order by category). */
export const tools = TOOLS_LIST;

/** Lookup by slug. */
export const toolsBySlug = Object.fromEntries(TOOLS_LIST.map((t) => [t.slug, t]));

/** Categories with their tools for API list response. */
export function getCategoriesWithTools() {
  const byCategory = {};
  for (const tool of TOOLS_LIST) {
    if (!byCategory[tool.category]) byCategory[tool.category] = [];
    byCategory[tool.category].push(tool);
  }
  return CATEGORY_ORDER.filter((c) => byCategory[c]).map((name) => ({
    name,
    tools: byCategory[name],
  }));
}
