import { BASE_URL } from "@/lib/constants";

export async function GET(request) {
  if (request.headers.get('x-indexnow-secret') !== process.env.INDEXNOW_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const key = process.env.INDEXNOW_KEY
  if (!key) {
    return Response.json({ error: 'INDEXNOW_KEY is not set' }, { status: 500 })
  }

  const host = new URL(BASE_URL).host
  const locales = ['en', 'it', 'es', 'fr', 'de', 'pt', 'zh', 'hi', 'ar']
  const tools = [
    'compress-image', 'merge-pdf', 'heic-to-jpg', 'resize-image',
    'jpg-to-png', 'pdf-to-jpg', 'png-to-jpg', 'image-to-pdf',
    'compress-pdf', 'webp-to-jpg', 'split-pdf', 'png-to-pdf',
    'jpg-to-pdf', 'svg-to-png', 'rotate-pdf', 'image-to-webp',
    'pdf-to-png', 'gif-to-mp4', 'crop-image', 'bmp-to-jpg',
    'extract-pdf-pages', 'tiff-to-jpg', 'add-watermark-pdf', 'mp4-to-gif',
    'jpg-to-webp', 'pdf-to-text', 'create-zip',
    'trim-video', 'video-to-mp3', 'compress-video',
    'mute-video', 'video-speed', 'add-audio-to-video',
    'resize-video', 'merge-videos', 'loop-video',
    'remove-background', 'resize-image-social', 'add-text-to-image',
    'trim-audio', 'audio-to-mp3', 'qr-code-generator',
    'stl-viewer', 'obj-to-stl', 'image-to-lithophane',
    'compare', 'pdf-unlock', 'protect-pdf', 'pdf-add-page-numbers',
    'reorder-pdf-pages', 'word-to-pdf', 'favicon-generator', 'dxf-viewer',
    'excel-to-pdf', 'pdf-to-pdfa', 'csv-to-pdf',
  ]

  const urls = [
    BASE_URL,
    ...locales.filter(l => l !== 'en').map(l => `${BASE_URL}/${l}`),
    ...locales.flatMap(l =>
      tools.map(t => (l === 'en' ? `${BASE_URL}/tools/${t}` : `${BASE_URL}/${l}/tools/${t}`))
    ),
  ]

  try {
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host,
        key: key,
        keyLocation: `${BASE_URL}/${key}.txt`,
        urlList: urls,
      }),
    })

    return Response.json({
      success: true,
      urlCount: urls.length,
      status: response.status,
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
