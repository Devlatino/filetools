/**
 * Slug (URL segment) -> translation namespace id for tools.*.label
 */
export const SLUG_TO_ID = {
  "compress-image": "compressImage",
  "merge-pdf": "mergePdf",
  "heic-to-jpg": "heicToJpg",
  "resize-image": "resizeImage",
  "jpg-to-png": "jpgToPng",
  "pdf-to-jpg": "pdfToJpg",
};

/**
 * For each tool slug, list related tool slugs (similar or complementary).
 */
export const RELATED_TOOLS = {
  "compress-image": ["heic-to-jpg", "resize-image", "jpg-to-png"],
  "merge-pdf": ["compress-image", "pdf-to-jpg", "heic-to-jpg"],
  "heic-to-jpg": ["compress-image", "jpg-to-png", "resize-image"],
  "resize-image": ["compress-image", "jpg-to-png", "heic-to-jpg"],
  "jpg-to-png": ["compress-image", "resize-image", "heic-to-jpg"],
  "pdf-to-jpg": ["merge-pdf", "compress-image", "heic-to-jpg"],
};
