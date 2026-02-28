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
  "webp-to-jpg": "webpToJpg",
  "split-pdf": "splitPdf",
  "png-to-pdf": "pngToPdf",
  "jpg-to-pdf": "jpgToPdf",
  "svg-to-png": "svgToPng",
  "rotate-pdf": "rotatePdf",
  "image-to-webp": "imageToWebp",
  "pdf-to-png": "pdfToPng",
  "gif-to-mp4": "gifToMp4",
};

/**
 * For each tool slug, list related tool slugs (similar or complementary).
 */
export const RELATED_TOOLS = {
  "compress-image": ["heic-to-jpg", "resize-image", "jpg-to-png"],
  "merge-pdf": ["compress-image", "pdf-to-jpg", "compress-pdf", "split-pdf"],
  "heic-to-jpg": ["compress-image", "jpg-to-png", "resize-image"],
  "resize-image": ["compress-image", "jpg-to-png", "heic-to-jpg"],
  "jpg-to-png": ["compress-image", "resize-image", "png-to-jpg"],
  "pdf-to-jpg": ["merge-pdf", "compress-image", "pdf-to-png"],
  "png-to-jpg": ["jpg-to-png", "webp-to-jpg", "compress-image", "resize-image"],
  "image-to-pdf": ["merge-pdf", "compress-pdf", "pdf-to-jpg", "png-to-pdf"],
  "compress-pdf": ["merge-pdf", "image-to-pdf", "pdf-to-jpg", "split-pdf"],
  "webp-to-jpg": ["png-to-jpg", "image-to-webp", "compress-image", "resize-image"],
  "split-pdf": ["merge-pdf", "compress-pdf", "pdf-to-jpg", "rotate-pdf"],
  "png-to-pdf": ["image-to-pdf", "jpg-to-pdf", "merge-pdf", "compress-pdf"],
  "jpg-to-pdf": ["image-to-pdf", "png-to-pdf", "merge-pdf", "compress-pdf"],
  "svg-to-png": ["jpg-to-png", "png-to-jpg", "compress-image", "resize-image"],
  "rotate-pdf": ["split-pdf", "merge-pdf", "compress-pdf", "pdf-to-jpg"],
  "image-to-webp": ["webp-to-jpg", "compress-image", "resize-image", "jpg-to-png"],
  "pdf-to-png": ["pdf-to-jpg", "merge-pdf", "split-pdf", "image-to-pdf"],
  "gif-to-mp4": ["compress-image", "image-to-webp", "resize-image"],
};
