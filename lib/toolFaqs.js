/**
 * FAQ (8–10 domande e risposte) per ogni tool. Usato per la sezione FAQ in pagina e per lo schema FAQPage.
 * Le chiavi corrispondono al path del tool (es. "compress-image").
 */
export const toolFaqs = {
  "compress-image": [
    {
      question: "How do you compress an image online?",
      answer:
        "Upload your photo (JPG, PNG or WebP) using the button, choose a quality level with the slider, then click compress. You can compare the original and compressed result side by side before downloading. Everything runs in your browser, so no data is sent to any server.",
    },
    {
      question: "Is image quality reduced?",
      answer:
        "Compression always involves a trade-off between file size and quality. You control this with the quality slider: lower values give smaller files but more visible loss. We recommend trying 60–80 for a good balance. The preview lets you check the result before downloading.",
    },
    {
      question: "What formats are supported?",
      answer:
        "You can upload and compress JPG (JPEG), PNG and WebP images. The compressed output keeps the same format as the original. These formats cover the vast majority of photos and graphics used on the web and in apps.",
    },
    {
      question: "Are files saved on the server?",
      answer:
        "No. All processing happens in your browser. Your images are never uploaded to our servers or stored anywhere. You stay in full control of your files from start to finish.",
    },
    {
      question: "Is there a file size limit?",
      answer:
        "There is no fixed limit set by the tool. Practical limits depend on your device and browser memory. Very large images (e.g. tens of megabytes) may take longer to process or, on low-memory devices, cause the browser to slow down. For typical photos (a few MB), there are no issues.",
    },
    {
      question: "What is the difference between JPG and PNG in compression?",
      answer:
        "JPG uses lossy compression: it discards some detail to achieve much smaller file sizes, which makes it ideal for photos. PNG uses lossless compression: it keeps every pixel intact but produces larger files, and is better for graphics with sharp edges or transparency. For photos on the web, JPG usually gives the best balance of size and quality; use PNG when you need transparency or exact reproduction of logos and UI elements.",
    },
    {
      question: "How do I compress images for WhatsApp?",
      answer:
        "WhatsApp automatically compresses photos when you send them, which can reduce quality. To keep control, compress your image first with this tool at a quality you choose (e.g. 75–80), then send the result: the file will be smaller and may be altered less by WhatsApp. Use JPG for photos; avoid sending huge originals so the app does not apply its own heavy compression. The tool runs in the browser, so you can do it quickly from your phone or computer before sharing.",
    },
    {
      question: "Can I compress multiple images at once?",
      answer:
        "Yes. You can add several images in one go: use the upload button and select multiple files, or drag and drop a batch. Each image is compressed separately and you can adjust quality per image if needed. When you are done, download each file individually or use the option to download all as a ZIP. Processing runs in your browser, so there is no limit imposed by the tool—only your device memory for very large batches.",
    },
    {
      question: "Is compression reversible?",
      answer:
        "No. Lossy compression (as used for JPG and WebP at lower quality) permanently removes some image data; you cannot restore the exact original from the compressed file. If you might need the full quality later, keep a copy of the original before compressing. PNG compression is lossless, so the image can be decoded back to the same pixels, but the file size reduction is smaller. This tool does not store your files, so always keep your originals on your device if you want to revert.",
    },
    {
      question: "What is the best format for photos on the web?",
      answer:
        "For most photos on websites and blogs, JPG is still the best choice: it gives small file sizes and good visual quality at 75–85% quality. WebP often produces even smaller files at similar quality and is supported by all modern browsers; use it when you want faster page loads. PNG is better for images with transparency or sharp graphics. Save photos as JPG or WebP for hero images, galleries, and thumbnails; use PNG for logos and graphics with transparent backgrounds.",
    },
  ],
  "merge-pdf": [
    {
      question: "How do I merge PDFs online?",
      answer:
        "Click the button to add one or more PDF files from your device. They appear in a list below. Drag the rows to change the order of the documents. When you are happy with the order, click “Merge PDF” to create a single PDF and download it. The process runs entirely in your browser, so your files never leave your device.",
    },
    {
      question: "Can I reorder the pages?",
      answer:
        "You reorder whole documents, not individual pages. Drag the file rows up or down to set the order in which each PDF appears in the merged file. The pages of each PDF keep their internal order; the merged PDF is document 1’s pages, then document 2’s, and so on. If you need to reorder single pages within a PDF, you would need a separate tool that supports page-level editing.",
    },
    {
      question: "Are my PDFs sent to a server?",
      answer:
        "No. Merging is done locally in your browser. Your files never leave your device or get stored on our servers. This keeps your documents private and secure. You can merge sensitive or confidential PDFs without any upload.",
    },
    {
      question: "Is there a limit to how many PDFs I can merge?",
      answer:
        "There is no fixed limit in the tool. Very large numbers of files or very big PDFs may make the browser use a lot of memory and take longer. For typical documents (e.g. a few dozen PDFs of a few MB each), merging works without issues. If you hit performance limits, try merging in smaller batches and then merging the resulting PDFs.",
    },
    {
      question: "Does merging reduce PDF quality?",
      answer:
        "No. The tool combines the existing content of your PDFs without re-encoding or re-compressing the pages. Text and images in the merged PDF stay at the same quality as in the originals. The output is a single PDF that behaves like one continuous document.",
    },
    {
      question: "Can I remove a file from the list before merging?",
      answer:
        "Yes. Each file in the list has a remove or delete option so you can take it out before clicking Merge. Reorder the remaining files as needed, then merge. If you change your mind, add the file again and adjust the order.",
    },
    {
      question: "What happens to bookmarks and links in the PDFs?",
      answer:
        "Bookmarks and internal links from the original PDFs are preserved in the merged file where the library supports it. Very complex PDFs with nested bookmarks may have simplified structure in the result. External links and hyperlinks generally remain clickable in the merged PDF.",
    },
    {
      question: "Does it work on mobile?",
      answer:
        "Yes. The tool runs in the mobile browser (Safari on iPhone, Chrome or others on Android). You can add PDFs from your device or cloud storage, reorder them, and download the merged file. No app install is required; processing happens in the browser so file size limits depend on your device’s memory.",
    },
    {
      question: "Can I merge password-protected PDFs?",
      answer:
        "Password-protected (encrypted) PDFs must be unlocked first before this tool can read them. Open the PDF with the correct password in another app, save it without password protection, then use that copy here. The merge tool itself does not ask for or handle PDF passwords.",
    },
  ],
  "heic-to-jpg": [
    {
      question: "What is HEIC?",
      answer:
        "HEIC (High Efficiency Image Container) is the default photo format on iPhones and some Android devices. It offers smaller file sizes than JPG at similar quality. Converting to JPG makes photos easier to share on social media, email, and websites that do not support HEIC, and the conversion runs in your browser so files never leave your device.",
    },
    {
      question: "Can I convert multiple files?",
      answer:
        "Yes. Select multiple HEIC files when you upload; the tool processes them one by one and shows progress. You can download each JPG individually or use the option to download all converted photos in a single ZIP. There is no fixed limit—very large batches may take longer depending on your device.",
    },
    {
      question: "Is quality lost?",
      answer:
        "JPG uses lossy compression, so there can be a small quality reduction compared to the original HEIC. For typical use (sharing, printing, web) the result is usually very good and the difference is hard to notice. If you need maximum quality, keep the HEIC originals for archival and use JPG for sharing.",
    },
    {
      question: "Are my photos sent to a server?",
      answer:
        "No. Conversion runs entirely in your browser. Your files never leave your device or get stored on our servers. This keeps your photos private and is ideal for personal or sensitive images.",
    },
    {
      question: "Why download as ZIP?",
      answer:
        "When you convert many files, downloading one ZIP is faster than saving each JPG individually. The ZIP contains all converted images with the same names (with .jpg extension). You can then extract them on your computer or phone and share or backup as needed.",
    },
    {
      question: "Does it work on iPhone and iPad?",
      answer:
        "Yes. Open the tool in Safari (or another browser) on your iPhone or iPad, then tap to add HEIC photos from your camera roll or Files app. The conversion runs in the browser and you can download each JPG or a ZIP. No app install is required.",
    },
    {
      question: "Are metadata and EXIF preserved?",
      answer:
        "Basic metadata such as date taken can be preserved when the conversion is done in the browser, depending on the library used. For full EXIF (camera model, GPS, etc.) preservation, some tools may strip or simplify it when encoding JPG. If you need exact EXIF, check the output or use a dedicated desktop tool.",
    },
    {
      question: "What is the output resolution?",
      answer:
        "The converted JPG keeps the same dimensions (pixel width and height) as the original HEIC. Only the format and compression change; resolution is not reduced. You get a standard JPG that you can use for print or web at the same size as the source.",
    },
    {
      question: "Can I convert HEIC to PNG or WebP instead?",
      answer:
        "This tool converts HEIC to JPG only. JPG is the most widely supported format for sharing and is sufficient for most uses. If you need PNG (e.g. for transparency) or WebP, you would need to convert HEIC to JPG first, then use another tool to convert JPG to the desired format, or use a converter that supports HEIC to PNG/WebP directly.",
    },
  ],
};

export function getToolFaq(toolPath) {
  return toolFaqs[toolPath] || [];
}
