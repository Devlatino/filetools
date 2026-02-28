/**
 * Slug (URL segment) -> translation namespace id for tools.*.label
 */
export const SLUG_TO_ID = {
  "compress-image": "compressImage",
  "merge-pdf": "mergePdf",
  "heic-to-jpg": "heicToJpg",
};

/**
 * For each tool slug, list related tool slugs (similar or complementary).
 */
export const RELATED_TOOLS = {
  "compress-image": ["heic-to-jpg", "merge-pdf"],
  "merge-pdf": ["compress-image", "heic-to-jpg"],
  "heic-to-jpg": ["compress-image", "merge-pdf"],
};
