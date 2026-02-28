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
  "png-to-jpg": "pngToJpg",
  "image-to-pdf": "imageToPdf",
  "compress-pdf": "compressPdf",
};

/**
 * For each tool slug, list related tool slugs (similar or complementary).
 */
export const RELATED_TOOLS = {
  "compress-image": ["heic-to-jpg", "resize-image", "jpg-to-png"],
  "merge-pdf": ["compress-image", "pdf-to-jpg", "compress-pdf"],
  "heic-to-jpg": ["compress-image", "jpg-to-png", "resize-image"],
  "resize-image": ["compress-image", "jpg-to-png", "heic-to-jpg"],
  "jpg-to-png": ["compress-image", "resize-image", "png-to-jpg"],
  "pdf-to-jpg": ["merge-pdf", "compress-image", "heic-to-jpg"],
  "png-to-jpg": ["jpg-to-png", "compress-image", "resize-image"],
  "image-to-pdf": ["merge-pdf", "compress-pdf", "pdf-to-jpg"],
  "compress-pdf": ["merge-pdf", "image-to-pdf", "pdf-to-jpg"],
};
