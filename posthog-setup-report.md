<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the FileFlip Next.js App Router project. Here is a summary of all changes made:

**Infrastructure**
- Installed `posthog-js` package
- Created `instrumentation-client.js` at the project root — initializes PostHog client-side using the Next.js 15.3+ recommended approach (no provider needed)
- Added PostHog reverse-proxy rewrites to `next.config.mjs` (`/ingest/*` → `https://eu.i.posthog.com`) to avoid ad-blocker interference
- Added `skipTrailingSlashRedirect: true` to support PostHog trailing-slash API requests
- Stored `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` in `.env.local`

**Event tracking added to 7 tool pages**

| Event | Description | File |
|---|---|---|
| `tool_conversion_completed` | PDF compression completed successfully | `app/[locale]/tools/compress-pdf/page.js` |
| `tool_file_downloaded` | User downloaded compressed PDF | `app/[locale]/tools/compress-pdf/page.js` |
| `tool_conversion_completed` | Image compression completed successfully | `app/[locale]/tools/compress-image/page.js` |
| `tool_file_downloaded` | User downloaded compressed image | `app/[locale]/tools/compress-image/page.js` |
| `tool_conversion_completed` | Video compression completed (ffmpeg) | `app/[locale]/tools/compress-video/page.js` |
| `tool_file_downloaded` | User downloaded compressed video | `app/[locale]/tools/compress-video/page.js` |
| `tool_conversion_completed` | Word to PDF conversion completed | `app/[locale]/tools/word-to-pdf/page.js` |
| `tool_conversion_failed` | Word to PDF conversion failed | `app/[locale]/tools/word-to-pdf/page.js` |
| `tool_conversion_completed` | PDF password protection completed | `app/[locale]/tools/protect-pdf/page.js` |
| `tool_file_downloaded` | User downloaded protected PDF | `app/[locale]/tools/protect-pdf/page.js` |
| `tool_conversion_completed` | Background removal completed (AI) | `app/[locale]/tools/remove-background/page.js` |
| `tool_file_downloaded` | User downloaded background-removed image | `app/[locale]/tools/remove-background/page.js` |
| `tool_conversion_completed` | HEIC to JPG conversion completed | `app/[locale]/tools/heic-to-jpg/page.js` |
| `tool_conversion_completed` | PDF unlock completed | `app/[locale]/tools/pdf-unlock/page.js` |
| `tool_file_downloaded` | User downloaded unlocked PDF | `app/[locale]/tools/pdf-unlock/page.js` |

All events include a `tool` property identifying the tool used, plus relevant properties like `file_size_bytes`, `result_size_bytes`, `file_type`, etc. `posthog.captureException()` is also added to all error paths for automatic error tracking.

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://eu.posthog.com/project/159382/dashboard/621701
- **Funnel: conversion completed → file downloaded**: https://eu.posthog.com/project/159382/insights/sM46xdXv
- **Tool conversions by tool (bar chart)**: https://eu.posthog.com/project/159382/insights/PfNaS4rd
- **Daily completions and downloads over time**: https://eu.posthog.com/project/159382/insights/mOYfSeY4
- **Tool conversion errors by tool**: https://eu.posthog.com/project/159382/insights/3I52kOsq
- **Unique users who completed a conversion**: https://eu.posthog.com/project/159382/insights/DkqGnWQY

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
