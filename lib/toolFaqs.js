/**
 * FAQ (5 domande e risposte) per ogni tool. Usato per la sezione FAQ in pagina e per lo schema FAQPage.
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
  ],
  "merge-pdf": [
    {
      question: "How do I merge PDFs online?",
      answer:
        "Click the button to add one or more PDF files from your device. They appear in a list below. Drag the rows to change the order of the documents. When you are happy with the order, click “Merge PDF” to create a single PDF and download it. The process runs entirely in your browser.",
    },
    {
      question: "Can I reorder the pages?",
      answer:
        "You reorder whole documents, not individual pages. Drag the file rows up or down to set the order in which each PDF appears in the merged file. The pages of each PDF keep their internal order; the merged PDF is document 1’s pages, then document 2’s, and so on.",
    },
    {
      question: "Are my PDFs sent to a server?",
      answer:
        "No. Merging is done locally in your browser. Your files never leave your device or get stored on our servers. This keeps your documents private and secure.",
    },
    {
      question: "Is there a limit to how many PDFs I can merge?",
      answer:
        "There is no fixed limit in the tool. Very large numbers of files or very big PDFs may make the browser use a lot of memory and take longer. For typical documents (e.g. a few dozen PDFs of a few MB each), merging works without issues.",
    },
    {
      question: "Does merging reduce PDF quality?",
      answer:
        "No. The tool combines the existing content of your PDFs without re-encoding or re-compressing the pages. Text and images in the merged PDF stay at the same quality as in the originals.",
    },
  ],
  "compress-pdf": [
    {
      question: "How does PDF compression work here?",
      answer:
        "You upload one or more PDFs and choose a compression level (low, medium or high). The tool reprocesses the file to reduce its size. You then download the compressed PDF(s). All processing happens in your browser; nothing is sent to a server.",
    },
    {
      question: "Will the compressed PDF look different?",
      answer:
        "Higher compression can make images in the PDF look slightly less sharp or increase the chance of small visual changes. Text is usually unaffected. Use the medium setting for a good balance; use low compression if you need the smallest possible change in appearance.",
    },
    {
      question: "Are my PDFs stored on your servers?",
      answer:
        "No. Compression runs locally in your browser. Your documents are never uploaded to or stored on our servers, so they stay private and under your control.",
    },
    {
      question: "What PDF types can I compress?",
      answer:
        "Standard PDFs (text and images) work best. Password-protected or heavily restricted PDFs might not process correctly. The tool supports common PDFs created by most apps and scanners.",
    },
    {
      question: "Is there a maximum file size?",
      answer:
        "There is no fixed limit set by the tool. Very large PDFs may take longer to process and use more memory in your browser. For typical documents (a few MB to a few tens of MB), compression works without problems.",
    },
  ],
  "jpg-to-png": [
    {
      question: "How do I convert JPG to PNG online?",
      answer:
        "Upload one or more JPG (or JPEG) files using the button. Click convert and the tool will produce PNG versions. You can preview and download each converted image. Conversion runs in your browser; no files are sent to a server.",
    },
    {
      question: "Why would I convert JPG to PNG?",
      answer:
        "PNG supports transparency and is lossless, so it’s often used for graphics, logos and screenshots where sharp edges or transparent backgrounds matter. JPG is better for photos. Converting to PNG is useful when you need these PNG features.",
    },
    {
      question: "Is the quality preserved?",
      answer:
        "Converting from JPG to PNG does not add back detail that was lost when the image was saved as JPG. The PNG will match the current quality of your JPG. Because PNG is lossless, further editing and saving won’t degrade it further.",
    },
    {
      question: "Are my images uploaded to a server?",
      answer:
        "No. Conversion happens entirely in your browser. Your JPG and PNG files never leave your device or get stored on our systems.",
    },
    {
      question: "Can I convert multiple files at once?",
      answer:
        "Yes. You can select multiple JPG files in one go. The tool converts them all and lets you download each PNG individually. Only JPG/JPEG files are processed; other formats are ignored.",
    },
  ],
  "png-to-jpg": [
    {
      question: "How do I convert PNG to JPG online?",
      answer:
        "Upload one or more PNG files with the button, then click convert. The tool generates JPG versions that you can preview and download. Everything runs in your browser; no images are sent to a server.",
    },
    {
      question: "Will I lose quality converting to JPG?",
      answer:
        "JPG uses lossy compression, so some detail can be lost and transparent areas become a solid background (usually white). For photos this is usually fine. For graphics with transparency, consider keeping the PNG or choosing a background colour if the tool supports it.",
    },
    {
      question: "What happens to transparency?",
      answer:
        "JPG does not support transparency. Transparent areas in your PNG are typically converted to a solid colour (often white). If you need to keep transparency, stay with PNG or use a format that supports it.",
    },
    {
      question: "Are my files sent to a server?",
      answer:
        "No. Conversion is done locally in your browser. Your PNG and JPG files never leave your device or get stored on our servers.",
    },
    {
      question: "Can I convert multiple PNGs?",
      answer:
        "Yes. You can add several PNG files at once. The tool converts each to JPG and you can download them one by one. Only PNG files are converted; other formats are skipped.",
    },
  ],
  "image-to-webp": [
    {
      question: "How do I convert images to WebP online?",
      answer:
        "Upload one or more images (e.g. JPG or PNG) using the button, then start the conversion. The tool produces WebP files that you can preview and download. All processing happens in your browser; nothing is uploaded to a server.",
    },
    {
      question: "Why use WebP?",
      answer:
        "WebP often gives smaller file sizes than JPG or PNG at similar quality, so pages load faster and use less bandwidth. It’s widely supported in modern browsers and is a good choice for web images.",
    },
    {
      question: "Is WebP supported everywhere?",
      answer:
        "Most current browsers support WebP. Some older browsers or strict environments may not. If you need maximum compatibility, keep a JPG or PNG fallback or use WebP only where you know it’s supported.",
    },
    {
      question: "Are my images stored on your servers?",
      answer:
        "No. Conversion runs entirely in your browser. Your original and WebP files never leave your device or get stored on our systems.",
    },
    {
      question: "Can I convert multiple images at once?",
      answer:
        "Yes. You can select multiple files in one go. The tool converts each to WebP and you can download the results individually. Only image formats accepted by the tool are processed.",
    },
  ],
  "resize-image": [
    {
      question: "How do I resize an image online?",
      answer:
        "Upload your image and set the maximum width and/or height you want. The tool resizes it while keeping the aspect ratio. You can then preview and download the result. Resizing runs in your browser; no file is sent to a server.",
    },
    {
      question: "Will resizing reduce quality?",
      answer:
        "Making an image smaller usually keeps it looking sharp. Making it larger can look blurry because the tool can’t add real detail. For thumbnails, avatars or fixed dimensions (e.g. for a form), resizing to the exact size you need is the right approach.",
    },
    {
      question: "What formats can I resize?",
      answer:
        "The tool accepts common image formats such as JPG, PNG and WebP. The resized output is in a suitable format. Check the tool’s interface for the exact list of supported input and output formats.",
    },
    {
      question: "Are my images uploaded to a server?",
      answer:
        "No. Resizing is done locally in your browser. Your images never leave your device or get stored on our servers.",
    },
    {
      question: "Is there a maximum size for the output?",
      answer:
        "Practical limits depend on your device and browser. The tool lets you set the dimensions you need. Very large output dimensions may take longer to process or use a lot of memory.",
    },
  ],
  "pdf-to-images": [
    {
      question: "How do I convert PDF pages to images online?",
      answer:
        "Upload a PDF file, then start the conversion. Each page is turned into an image (e.g. PNG). You can preview and download individual pages or all of them in a ZIP. Everything runs in your browser; the PDF is not sent to a server.",
    },
    {
      question: "What image format do I get?",
      answer:
        "Pages are typically exported as PNG images so that text and graphics stay clear. You can download single images or all pages in one ZIP file for convenience.",
    },
    {
      question: "Are my PDFs stored on your servers?",
      answer:
        "No. The PDF is processed entirely in your browser. Your document never leaves your device or gets stored on our systems, so your content stays private.",
    },
    {
      question: "Is there a page limit?",
      answer:
        "There is no fixed limit in the tool. Very long PDFs may take longer and use more memory in your browser. For typical documents (e.g. a few dozen pages), conversion works without issues.",
    },
    {
      question: "Can I choose which pages to convert?",
      answer:
        "The tool converts all pages by default. You can then download only the images you need, or download the full set as a ZIP. Check the interface for any options to select specific page ranges if available.",
    },
  ],
  "create-zip": [
    {
      question: "How do I create a ZIP file online?",
      answer:
        "Add the files you want to include using the upload button. You can add multiple files in one or several steps. When the list is ready, click to create the ZIP and download it. Creation runs in your browser; no files are sent to a server.",
    },
    {
      question: "Are my files sent to a server?",
      answer:
        "No. The ZIP is built locally in your browser. Your files never leave your device or get stored on our servers. You keep full control and privacy.",
    },
    {
      question: "Is there a limit on files or size?",
      answer:
        "There is no fixed limit set by the tool. Very large numbers of files or very big files may use a lot of memory and take longer. For typical use (e.g. a few dozen files or a few hundred MB total), creating a ZIP works without problems.",
    },
    {
      question: "Can I add folders?",
      answer:
        "The tool usually works with a flat list of files. If you need a folder structure inside the ZIP, you may need to create that structure in a desktop app and then upload the ZIP here, or check if the tool supports folder names in file paths.",
    },
    {
      question: "What can I put in the ZIP?",
      answer:
        "You can add any file types: documents, images, videos, etc. The ZIP is just a container. Keep in mind very large or numerous files may take longer to process in the browser.",
    },
  ],
  "extract-zip": [
    {
      question: "How do I extract a ZIP file online?",
      answer:
        "Upload your ZIP file using the button. The tool reads the archive and lists the files inside. You can download individual files or download all of them at once. Extraction runs in your browser; the ZIP is not sent to a server.",
    },
    {
      question: "Are my files stored on your servers?",
      answer:
        "No. The ZIP is opened and processed entirely in your browser. Nothing is uploaded to or stored on our servers. Your files stay on your device and under your control.",
    },
    {
      question: "Can I extract only some files?",
      answer:
        "Yes. After the tool lists the contents, you can choose which files to download one by one, or use the option to download all. You are not forced to download everything.",
    },
    {
      question: "What ZIP types are supported?",
      answer:
        "Standard ZIP archives created by common tools and operating systems are supported. Some older or non-standard ZIP variants might not open correctly. Password-protected ZIPs require the tool to support password entry; check the interface for that option.",
    },
    {
      question: "Is there a size limit for the ZIP?",
      answer:
        "There is no fixed limit set by the tool. Very large ZIPs may take longer to read and use more memory in your browser. For typical archives (e.g. up to a few hundred MB), extraction works without issues.",
    },
  ],
};

export function getToolFaq(toolPath) {
  return toolFaqs[toolPath] || [];
}
