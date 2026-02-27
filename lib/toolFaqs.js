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
  "svg-to-png": [
    { question: "How do I convert SVG to PNG?", answer: "Upload an SVG file, set the output width in pixels, then click convert. You get a preview and can download the PNG. Everything runs in your browser using the Canvas API; no file is sent to a server." },
    { question: "What SVG files are supported?", answer: "Standard SVG files (including inline or referenced content that the browser can render) work. Complex SVGs with external resources or scripts may not render identically. The tool uses the browser’s native SVG rendering." },
    { question: "Are my files uploaded?", answer: "No. Conversion runs entirely in your browser. Your SVG and PNG never leave your device or get stored on our servers." },
    { question: "Can I choose the output size?", answer: "Yes. You set the output width in pixels; the height is calculated to keep the aspect ratio. This lets you get high-resolution PNGs for print or lower resolution for web." },
    { question: "Is there a size limit?", answer: "Practical limits depend on your device and browser memory. Very large dimensions may take longer or cause the browser to slow down. Typical sizes (e.g. up to 2000px wide) work without issues." },
  ],
  "remove-background": [
    { question: "How does background removal work?", answer: "You upload an image and the tool uses a model that runs in your browser (WebAssembly) to detect the subject and remove the background. The result is a PNG with transparency. No image is sent to a server." },
    { question: "What image formats can I use?", answer: "You can upload common formats such as JPG and PNG. The output is PNG with transparency so you can overlay the subject on another background." },
    { question: "Are my images stored?", answer: "No. Processing happens entirely in your browser. Your images never leave your device or get stored on our servers." },
    { question: "Why is it slow the first time?", answer: "The first run downloads and initializes the model (WebAssembly and weights) in the browser. Later runs in the same session are faster. This is a one-time cost per session." },
    { question: "Does it work on all images?", answer: "It works best on images with a clear subject (person, product, etc.) and a distinct background. Very busy backgrounds or low contrast may give less clean edges. You can try and see the preview before downloading." },
  ],
  "merge-images": [
    { question: "How do I merge two images?", answer: "Upload two images, choose horizontal or vertical layout, then click merge. You see a preview and can download the result as a single image. Everything runs in your browser using the Canvas API." },
    { question: "What formats are supported?", answer: "You can upload common image formats (e.g. JPG, PNG, WebP). The merged result is typically PNG so quality is preserved. Check the tool for the exact list of accepted inputs." },
    { question: "Are my images sent to a server?", answer: "No. Merging is done locally in your browser. Your images never leave your device or get stored on our servers." },
    { question: "Can I change the order of the images?", answer: "The tool uses the first and second image you selected. To change which is left/right or top/bottom, upload them in the desired order or check if the tool has an option to swap." },
    { question: "Is there a size limit?", answer: "Practical limits depend on your device and browser. Very large images may take longer to process or use more memory. Typical photo sizes work without issues." },
  ],
  "pdf-to-text": [
    { question: "How do I extract text from a PDF?", answer: "Upload a PDF file and the tool extracts the text from all pages and shows it in a text area. You can copy the text or download it as a .txt file. Extraction runs in your browser using PDF.js; the PDF is not sent to a server." },
    { question: "Will the layout be preserved?", answer: "The tool extracts plain text, so layout (columns, tables, exact spacing) is not preserved. You get a continuous text stream. For layout-sensitive content, consider a PDF-to-image or dedicated PDF editor." },
    { question: "Are my PDFs stored?", answer: "No. The PDF is processed entirely in your browser. Your document never leaves your device or gets stored on our servers." },
    { question: "Do scanned PDFs work?", answer: "Scanned PDFs are images of pages, so there is no selectable text. The tool can only extract text from PDFs that contain real text layers. For scanned documents you would need OCR, which this tool does not provide." },
    { question: "Is there a page limit?", answer: "There is no fixed limit. Very long PDFs may take longer and use more memory. For typical documents (e.g. dozens of pages), extraction works without issues." },
  ],
  "add-watermark": [
    { question: "How do I add a watermark?", answer: "Upload an image, enter the watermark text, and choose position (e.g. center or corner), opacity and font size. You see a live preview and can download the result. Everything runs in your browser using the Canvas API." },
    { question: "Are my images uploaded?", answer: "No. Processing happens in your browser. Your images never leave your device or get stored on our servers." },
    { question: "Can I use an image as watermark?", answer: "This tool adds text watermarks only. For image watermarks (e.g. a logo), you would need an image editor or another tool that supports overlay images." },
    { question: "What output format do I get?", answer: "The result is typically PNG so that the watermark and image quality are preserved. You can use the downloaded file wherever you need a watermarked image." },
    { question: "Is there a file size limit?", answer: "Practical limits depend on your device and browser. Very large images may take longer to process. Typical photo sizes work without issues." },
  ],
  "color-converter": [
    { question: "How does the color converter work?", answer: "Enter a color in one format (HEX, RGB or HSL). The tool converts it instantly to the other two and shows a preview box. All calculations are done in JavaScript in your browser; no data is sent anywhere." },
    { question: "What formats are supported?", answer: "HEX (e.g. #ff5733 or ff5733), RGB (e.g. 255, 87, 51) and HSL (e.g. 9, 100%, 60%). The tool accepts common variants and updates the others in real time." },
    { question: "Is my input stored?", answer: "No. Everything runs in your browser. The values you type are only used for the conversion and preview; nothing is sent to or stored on any server." },
    { question: "Can I copy the converted values?", answer: "Yes. You can select and copy the HEX, RGB or HSL strings from the interface to use them in your code or design tools." },
    { question: "Why is there a preview box?", answer: "The preview box shows how the color looks, which helps you verify the conversion and use the color in designs or styles." },
  ],
  "favicon-generator": [
    { question: "How do I generate favicons?", answer: "Upload an image (PNG or JPG). The tool generates the common favicon sizes (e.g. 16x16, 32x32, 48x48, 180x180 for Apple touch icon) and lets you download them one by one or as a ZIP. Everything runs in your browser." },
    { question: "What sizes are generated?", answer: "Typically 16x16, 32x32, 48x48 and 180x180 pixels to cover standard favicons and Apple touch icon. Check the tool for the exact list. All are generated from your source image by resizing." },
    { question: "Are my images stored?", answer: "No. The image is processed in your browser. Your file never leaves your device or gets stored on our servers." },
    { question: "Can I use any image?", answer: "PNG and JPG are commonly supported. The image is scaled to each size; for best results use a square image or one that crops well to a square (the tool may use the center or full scale)." },
    { question: "Why download as ZIP?", answer: "The ZIP gives you all favicon sizes in one file, so you can upload them to your site or project in one step. You can also download each size individually if you prefer." },
  ],
  "compress-video": [
    { question: "How does video compression work?", answer: "You upload an MP4 video and choose a quality level. The tool compresses it in your browser using FFmpeg (WebAssembly) and shows a progress bar. When done, you download the compressed file. No video is sent to a server." },
    { question: "Are my videos stored?", answer: "No. Processing runs entirely in your browser. Your video never leaves your device or gets stored on our servers." },
    { question: "Why does it take a while?", answer: "Video encoding is heavy work. Running FFmpeg in the browser (WebAssembly) takes time, especially for long or high-resolution videos. The progress bar shows how far the job has gone." },
    { question: "What format is supported?", answer: "The tool accepts MP4 (H.264) and outputs compressed MP4. Other formats may not be supported. For best compatibility, use a standard MP4 file." },
    { question: "Is there a size or length limit?", answer: "Practical limits depend on your device and browser memory. Very long or large videos may take a long time or run out of memory. Shorter clips (e.g. under a few minutes) usually work well." },
  ],
  "extract-audio": [
    { question: "How do I extract audio from a video?", answer: "Upload an MP4 video and the tool extracts the audio track and offers it as an MP3 download. Processing runs in your browser using FFmpeg (WebAssembly) with a progress bar. No file is sent to a server." },
    { question: "Are my files stored?", answer: "No. The video is processed entirely in your browser. Your video and the extracted audio never leave your device or get stored on our servers." },
    { question: "What format is the output?", answer: "The output is MP3, which is widely supported for audio. If the source video has no audio track, the tool may show an error or produce a silent file." },
    { question: "Why does it take time?", answer: "Demuxing and encoding audio with FFmpeg in the browser (WebAssembly) is CPU-intensive. The progress bar indicates how far the process has gone. Longer videos take more time." },
    { question: "Does it work with any video?", answer: "The tool is designed for MP4. Other containers or codecs may not be supported. For best results use a standard MP4 file with an audio track." },
  ],
  "word-counter": [
    { question: "What does the word counter show?", answer: "It shows word count, character count (with and without spaces), number of sentences, paragraphs, estimated reading time (e.g. at 200 words per minute) and the top 10 most frequent words. All updates happen in real time as you type or paste." },
    { question: "Is my text stored?", answer: "No. Everything runs in your browser. Your text is never sent to or stored on any server. You can use it for private or sensitive content." },
    { question: "How is reading time calculated?", answer: "Reading time is typically estimated by dividing the word count by an average reading speed (e.g. 200 words per minute). The tool uses a fixed rate; you can adjust mentally if you read faster or slower." },
    { question: "Can I copy or download the text?", answer: "The text stays in the text area. You can select and copy it, or the tool may offer a button to download it as a .txt file. Statistics are for reference only." },
    { question: "Why show top words?", answer: "The top 10 most frequent words help you spot repeated terms or check keyword density. It’s useful for writing and simple SEO checks." },
  ],
  "heic-to-jpg": [
    { question: "What is HEIC?", answer: "HEIC is the default photo format on iPhones. Converting to JPG makes photos easier to share. Conversion runs in your browser; files never leave your device." },
    { question: "Can I convert multiple files?", answer: "Yes. Select multiple HEIC files. The tool shows progress and lets you download each JPG or all in a ZIP." },
    { question: "Is quality lost?", answer: "JPG is lossy; there can be a small quality reduction. For typical use the result is usually very good." },
    { question: "Are my photos sent to a server?", answer: "No. Conversion runs entirely in your browser. Your files never leave your device." },
    { question: "Why download as ZIP?", answer: "When you convert many files, one ZIP is faster than saving each JPG individually." },
  ],
  "remove-metadata": [
    { question: "What are EXIF metadata?", answer: "EXIF stores camera, date, GPS, etc. inside images. This tool removes all such data by redrawing the image on a clean canvas." },
    { question: "Can I see metadata before removing?", answer: "Yes. The tool displays the metadata found (using exifr) so you know what will be removed. You then download the cleaned image." },
    { question: "Are my images uploaded?", answer: "No. Everything runs in your browser. Your file never leaves your device." },
    { question: "What formats are supported?", answer: "JPG and PNG. The image is re-encoded without EXIF; appearance is unchanged." },
    { question: "Will the image look different?", answer: "No. Only embedded metadata is removed. Dimensions and pixels stay the same." },
  ],
  "pdf-to-pptx": [
    { question: "How does PDF to PowerPoint work?", answer: "Each PDF page is rendered as an image and placed on a slide. One slide per page. The tool uses pdfjs-dist and pptxgenjs in your browser." },
    { question: "Is the text editable in the PPTX?", answer: "No. Content is embedded as images. For editable text you would need OCR or another method." },
    { question: "Are my PDFs sent to a server?", answer: "No. The PDF is processed entirely in your browser." },
    { question: "What if my PDF has many pages?", answer: "Very long PDFs take longer. The progress bar shows how many pages have been processed." },
    { question: "Can I edit the slides after?", answer: "Yes. You get a standard PPTX. Open in PowerPoint and add text, resize, or reorder." },
  ],
  "color-palette": [
    { question: "How are colors extracted?", answer: "The tool reads pixel data from a canvas and uses color quantization (JavaScript) to find the 6 dominant colors. It shows HEX, RGB and HSL." },
    { question: "Can I copy a color code?", answer: "Yes. Click a color swatch to copy its HEX code to the clipboard." },
    { question: "Are my images uploaded?", answer: "No. The image is processed entirely in your browser." },
    { question: "What formats work?", answer: "Any format the browser can draw (JPG, PNG, WebP, etc.)." },
    { question: "Why 6 colors?", answer: "Six gives a clear, usable palette. You can use them as a starting point for design." },
  ],
  "text-diff": [
    { question: "How does the diff work?", answer: "Paste original and modified text. The tool uses the diff library for word-by-word changes. Additions in green, removals in red. Stats: added, removed, unchanged." },
    { question: "Is my text stored?", answer: "No. Everything runs in your browser. Your text is never sent to any server." },
    { question: "Can I compare long documents?", answer: "There is no fixed limit. Very long texts may take a moment to process." },
    { question: "Why word-by-word?", answer: "Word-level diff shows exactly which words were added or removed within a line." },
    { question: "What do the statistics mean?", answer: "Added: words in modified but not original. Removed: words in original but not modified. Unchanged: in both." },
  ],
  "encrypt-text": [
    { question: "How is text encrypted?", answer: "The tool uses crypto-js with AES-256. You enter a password; encryption runs in your browser. The password is never sent to any server." },
    { question: "Is the password stored?", answer: "No. The password is only used locally to encrypt or decrypt. You must remember it to decrypt later." },
    { question: "Can I share encrypted text?", answer: "Yes. Copy the encrypted string and share it. The recipient needs the same password to decrypt (e.g. with this tool)." },
    { question: "What if I lose the password?", answer: "There is no way to recover the text without the password. Keep it in a safe place." },
    { question: "Is this secure?", answer: "AES-256 is a strong standard. Security also depends on a strong password and not sharing it." },
  ],
  "markdown-to-html": [
    { question: "What is Markdown?", answer: "Markdown is a simple syntax for formatting text. This tool converts it to HTML with live preview and code highlighting (highlight.js)." },
    { question: "Is my content stored?", answer: "No. Conversion runs in your browser. Your text is never sent to any server." },
    { question: "What can I download?", answer: "Full HTML page or just the content HTML to paste into an existing page or CMS." },
    { question: "Does it support code highlighting?", answer: "Yes. highlight.js is used for syntax highlighting in code blocks in the preview." },
    { question: "What Markdown features?", answer: "The marked library supports headings, bold, italic, lists, links, images, code blocks, blockquotes, tables, etc." },
  ],
  "qr-generator": [
    { question: "What can I put in a QR code?", answer: "URL, text, email, phone, or WiFi. The tool has presets for URL, email, phone and WiFi." },
    { question: "Can I customize the look?", answer: "Yes. Size, QR color, background color, and optional logo in the center. Download as PNG or SVG." },
    { question: "Does a logo affect scanning?", answer: "A small center logo usually still allows scanning. Very large logos can reduce reliability." },
    { question: "Are my data sent?", answer: "No. The QR is generated in your browser. Your content is never sent to any server." },
    { question: "PNG vs SVG?", answer: "PNG is raster; SVG is vector and scales without quality loss." },
  ],
  "extract-frames": [
    { question: "How are frames extracted?", answer: "The tool uses the HTML5 video element and canvas. It seeks to chosen times, draws each frame to canvas, and exports as JPG. No server or FFmpeg." },
    { question: "What video formats?", answer: "Any format your browser can play (typically MP4). The video is read locally." },
    { question: "Can I choose how many frames?", answer: "Yes. Set the number of frames (evenly spaced) or the interval in seconds." },
    { question: "Are my videos uploaded?", answer: "No. Processing is entirely in your browser." },
    { question: "Why download as ZIP?", answer: "When you extract many frames, a ZIP is more convenient than saving each image one by one." },
  ],
  "csv-tools": [
    { question: "What can the CSV tool do?", answer: "Merge: combine two or more CSVs into one (with optional duplicate header handling). Split: divide one CSV by row count and download parts as ZIP." },
    { question: "How does merging handle headers?", answer: "You can keep the first file's header and skip duplicate headers from other files. Preview before downloading." },
    { question: "What parses the CSV?", answer: "PapaParse is used to read and write CSV. It handles quoted fields and different line endings." },
    { question: "Are my files uploaded?", answer: "No. All processing runs in your browser. Your CSVs never leave your device." },
    { question: "Can I split by custom row count?", answer: "Yes. In the split tab you choose how many rows per file. The tool chunks the CSV and offers them in a ZIP." },
  ],
};

export function getToolFaq(toolPath) {
  return toolFaqs[toolPath] || [];
}
