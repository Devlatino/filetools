/**
 * Slug (URL segment) -> translation namespace id for tools.*.label
 */
export const SLUG_TO_ID = {
  "compress-image": "compressImage",
  "merge-pdf": "mergePdf",
  "compress-pdf": "compressPdf",
  "jpg-to-png": "jpgToPng",
  "png-to-jpg": "pngToJpg",
  "image-to-webp": "imageToWebp",
  "resize-image": "resizeImage",
  "pdf-to-images": "pdfToImages",
  "create-zip": "createZip",
  "extract-zip": "extractZip",
};

/**
 * For each tool slug, list 3-4 related tool slugs (similar or complementary).
 */
export const RELATED_TOOLS = {
  "compress-image": ["jpg-to-png", "resize-image", "image-to-webp"],
  "merge-pdf": ["compress-pdf", "pdf-to-images", "create-zip"],
  "compress-pdf": ["merge-pdf", "pdf-to-images", "compress-image"],
  "jpg-to-png": ["png-to-jpg", "image-to-webp", "compress-image"],
  "png-to-jpg": ["jpg-to-png", "image-to-webp", "compress-image"],
  "image-to-webp": ["compress-image", "resize-image", "jpg-to-png"],
  "resize-image": ["compress-image", "image-to-webp", "jpg-to-png"],
  "pdf-to-images": ["merge-pdf", "compress-pdf", "image-to-webp"],
  "create-zip": ["extract-zip", "compress-pdf", "merge-pdf"],
  "extract-zip": ["create-zip", "compress-pdf", "merge-pdf"],
};
