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
  "svg-to-png": "svgToPng",
  "remove-background": "removeBackground",
  "merge-images": "mergeImages",
  "pdf-to-text": "pdfToText",
  "add-watermark": "addWatermark",
  "color-converter": "colorConverter",
  "favicon-generator": "faviconGenerator",
  "compress-video": "compressVideo",
  "extract-audio": "extractAudio",
  "word-counter": "wordCounter",
};

/**
 * For each tool slug, list 3-4 related tool slugs (similar or complementary).
 */
export const RELATED_TOOLS = {
  "compress-image": ["jpg-to-png", "resize-image", "image-to-webp", "remove-background"],
  "merge-pdf": ["compress-pdf", "pdf-to-images", "pdf-to-text", "create-zip"],
  "compress-pdf": ["merge-pdf", "pdf-to-images", "compress-image", "pdf-to-text"],
  "jpg-to-png": ["png-to-jpg", "image-to-webp", "compress-image", "svg-to-png"],
  "png-to-jpg": ["jpg-to-png", "image-to-webp", "compress-image", "favicon-generator"],
  "image-to-webp": ["compress-image", "resize-image", "jpg-to-png", "add-watermark"],
  "resize-image": ["compress-image", "image-to-webp", "jpg-to-png", "favicon-generator"],
  "pdf-to-images": ["merge-pdf", "compress-pdf", "pdf-to-text", "image-to-webp"],
  "create-zip": ["extract-zip", "compress-pdf", "merge-pdf", "favicon-generator"],
  "extract-zip": ["create-zip", "compress-pdf", "merge-pdf"],
  "svg-to-png": ["jpg-to-png", "resize-image", "merge-images", "favicon-generator"],
  "remove-background": ["compress-image", "add-watermark", "merge-images", "png-to-jpg"],
  "merge-images": ["resize-image", "add-watermark", "svg-to-png", "compress-image"],
  "pdf-to-text": ["merge-pdf", "pdf-to-images", "compress-pdf", "word-counter"],
  "add-watermark": ["remove-background", "merge-images", "resize-image", "compress-image"],
  "color-converter": ["favicon-generator", "add-watermark"],
  "favicon-generator": ["svg-to-png", "resize-image", "png-to-jpg", "create-zip"],
  "compress-video": ["extract-audio", "merge-pdf", "create-zip"],
  "extract-audio": ["compress-video", "create-zip", "merge-pdf"],
  "word-counter": ["pdf-to-text", "merge-pdf", "create-zip"],
};
