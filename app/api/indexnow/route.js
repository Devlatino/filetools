export async function GET(request) {
  if (request.headers.get('x-indexnow-secret') !== process.env.INDEXNOW_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const key = process.env.INDEXNOW_KEY
  if (!key) {
    return Response.json({ error: 'INDEXNOW_KEY is not set' }, { status: 500 })
  }

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
    'resize-video', 'merge-videos', 'loop-video'
  ]

  const urls = [
    'https://fileflip.org',
    ...locales.map(l => `https://fileflip.org/${l}`),
    ...tools.map(t => `https://fileflip.org/tools/${t}`),
    ...locales.flatMap(l =>
      tools.map(t => `https://fileflip.org/${l}/tools/${t}`)
    ),
  ]

  try {
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'fileflip.org',
        key: key,
        keyLocation: `https://fileflip.org/${key}.txt`,
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
