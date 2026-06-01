/**
 * Agent-facing docs for the Stella managed media API.
 *
 * Served as plain text (llms.txt-style) at:
 *   - https://stella.sh/docs/media          (overview)
 *   - https://stella.sh/docs/media/images   (image generation + edit)
 *   - https://stella.sh/docs/media/video    (image-to-video, video-to-video, extend)
 *   - https://stella.sh/docs/media/audio    (TTS, sound effects, transcription, separation)
 *   - https://stella.sh/docs/media/music    (text-to-music)
 *   - https://stella.sh/docs/media/3d       (text-to-3d)
 *
 * Audience: AI agents driving the Stella desktop app, not human readers.
 * Optimized for `curl` consumption — no headers, no nav, no boilerplate.
 *
 * Source of truth for what the gateway *accepts* lives in the backend
 * (`backend/convex/media_catalog.ts`). Keep the capability/profile IDs here
 * in sync when that catalog changes.
 */

export const MEDIA_DOCS_KINDS = [
  "images",
  "video",
  "audio",
  "music",
  "3d",
] as const;
export type MediaDocsKind = (typeof MEDIA_DOCS_KINDS)[number];

const isMediaDocsKind = (value: string): value is MediaDocsKind =>
  (MEDIA_DOCS_KINDS as readonly string[]).includes(value);

export const parseMediaDocsKind = (value: string): MediaDocsKind | null =>
  isMediaDocsKind(value) ? value : null;

const SHARED_CONTRACT = `
## Endpoint

POST <stella-api>/api/media/v1/generate
Content-Type: application/json
Authorization: Bearer <stella-session-token>

Where \`<stella-api>\` is the Stella backend base URL the desktop app is signed
in against (e.g. \`https://api.stella.sh\`). Reuse the user's existing session
token — do not invent your own credentials.

## Request body

\`\`\`json
{
  "capability": "<id>",          // required; see per-kind sections below
  "profile": "<id>",             // optional; defaults to the capability's preferred profile
  "prompt": "...",               // optional convenience field; mapped to the capability's prompt key
  "aspectRatio": "16:9",         // optional convenience field for image/video; mapped to aspect_ratio
  "sourceUrl": "https://...",    // optional; for capabilities that take a public URL
  "source": "data:image/png;base64,...", // optional; for local files (preferred)
  "sources": { "video": "data:...", "audio": "data:..." }, // for multi-input capabilities
  "input": { /* provider-specific overrides, merged on top of the convenience fields */ }
}
\`\`\`

\`source\` accepts a \`data:\` URI string or \`{ "base64": "...", "mimeType": "image/png" }\`.
The backend wraps the value into the right shape for the picked endpoint
(e.g. \`image_urls: ["data:..."]\` for image edit).

## Response (202 Accepted)

\`\`\`json
{
  "jobId": "job_123",
  "capability": "text_to_image",
  "profile": "best",
  "status": "queued",
  "upstreamStatus": "IN_QUEUE",
  "subscription": {
    "query": "api.media_jobs.getByJobId",
    "args": { "jobId": "job_123" }
  }
}
\`\`\`

## Watching for completion

Use the local \`stella-media\` command when you want normal
\`exec_command\`-style behavior. It submits the same gateway request, can wait
until the job reaches a terminal state, and saves completed outputs to
\`state/media/outputs/\`.

\`\`\`bash
cat > /tmp/stella-media-request.json <<'JSON'
{
  "capability": "text_to_image",
  "prompt": "a clean product render of a translucent blue desk lamp",
  "aspectRatio": "1:1"
}
JSON

stella-media generate --request-file /tmp/stella-media-request.json --wait --timeout 240
\`\`\`

Without \`--wait\`, \`stella-media generate\` returns after submit with a
\`jobId\`. To check a job later:

\`\`\`bash
stella-media status --job-id <jobId> --save
\`\`\`

The Stella desktop renderer also subscribes to every succeeded media job for
the signed-in user, downloads the output to
\`state/media/outputs/<jobId>_<i>.<ext>\`, and pops it open in the Display
sidebar automatically. If generation fails, Stella shows a failure
notification.

If you do need the raw status, subscribe to Convex:
\`useQuery(api.media_jobs.getByJobId, { jobId })\`. Status values:
\`queued\`, \`running\`, \`succeeded\`, \`failed\`, \`canceled\`.

## Auth failure (401)

If the user is not signed in, the endpoint returns a structured 401:

\`\`\`json
{
  "error": "Sign in to Stella to use media generation.",
  "code": "auth_required",
  "action": "Ask the user to open the Stella desktop app and finish signing in (Settings → Account, or the welcome screen on first launch). Once they're signed in, retry the same request — no payload changes needed.",
  "docsUrl": "https://stella.sh/docs/media"
}
\`\`\`

When you see \`code: "auth_required"\`:
1. Stop the in-flight job — do not retry on a backoff.
2. Surface \`action\` to the user verbatim so they know what to do.
3. Once they confirm sign-in, re-run the original request with the same payload.

The response also sets \`WWW-Authenticate: Bearer realm="stella-media"\` for
non-agent HTTP clients.

## Errors

All other errors return \`{ "error": "human-readable message" }\` with an
appropriate status. Upstream provider errors (content policy, validation,
rate limits) are parsed and forwarded as-is — show the message to the user.
`.trim();

const KIND_DESCRIPTIONS: Record<MediaDocsKind, string> = {
  images: "image generation and editing",
  video: "image-to-video, video extension, and video-to-video",
  audio:
    "speech-to-text, text-to-dialogue, sound effects, and audio separation",
  music: "text-to-music generation",
  "3d": "text-to-3d asset generation",
};

const renderHeader = (title: string, blurb: string): string =>
  `# ${title}\n\n${blurb}\n\nAudience: AI agents. Plain text on purpose. Curl me.`;

export const renderMediaDocsOverview = (): string =>
  [
    renderHeader(
      "Stella Managed Media API",
      "One HTTP endpoint, many capabilities. Submit a job, report success to the user. Outputs land on disk and in the Display sidebar automatically.",
    ),
    "",
    "## Per-kind docs",
    "",
    ...MEDIA_DOCS_KINDS.map(
      (kind) =>
        `- \`https://stella.sh/docs/media/${kind}\` — ${KIND_DESCRIPTIONS[kind]}`,
    ),
    "",
    SHARED_CONTRACT,
  ].join("\n");

const SECTION_IMAGES = `
## Capabilities

### \`text_to_image\` — generate images from text

- Profiles: \`best\` (default; photoreal with accurate in-image text), \`fast\` (quicker, lower fidelity).
- Convenience fields: \`prompt\`, \`aspectRatio\`.
- Useful \`input\` overrides: \`quality\` (\`low\` | \`medium\` | \`high\`), \`num_images\` (1–4), \`output_format\` (\`png\` | \`jpeg\` | \`webp\`).

\`\`\`bash
curl -X POST "$STELLA_API/api/media/v1/generate" \\
  -H "Authorization: Bearer $STELLA_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "capability": "text_to_image",
    "prompt": "cinematic rainy Tokyo alley at night",
    "aspectRatio": "9:16",
    "input": { "quality": "high", "num_images": 1 }
  }'
\`\`\`

### \`icon\` — icons, logos, thumbnails (square)

- Single profile (\`default\`); square output is enforced by the backend.
- Convenience field: \`prompt\`. Don't pass \`aspectRatio\`.
- Useful \`input\` hints: transparent / background style, brand constraints described in the prompt.

### \`image_edit\` — edit an existing image

- Single profile (\`default\`); supports mask-aware natural-language edits.
- Required: \`source\` (or \`sourceUrl\`) of the image to edit.
- Convenience fields: \`prompt\`, \`aspectRatio\` (defaults to \`auto\`).
- Useful \`input\` overrides: \`quality\`, \`num_images\`, \`mask_url\`.

\`\`\`bash
curl -X POST "$STELLA_API/api/media/v1/generate" \\
  -H "Authorization: Bearer $STELLA_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "capability": "image_edit",
    "prompt": "remove the background, keep the subject sharp",
    "source": "data:image/png;base64,<base64>"
  }'
\`\`\`

## Notes for agents

- If you need to know whether generation completed, use
  \`stella-media generate --request-file ... --wait --timeout 240\`. The
  command exits nonzero on failure or timeout and prints saved output paths on
  success.
- If you only need to kick off generation, submit without \`--wait\` and tell
  the user what you started. The Display sidebar will open with the result
  automatically when it finishes.
- For multi-image jobs, the materializer writes \`<jobId>_0.png\`, \`<jobId>_1.png\`, …
  to \`state/media/outputs/\` and shows them as a gallery.
`.trim();

const SECTION_VIDEO = `
## Capabilities

### \`image_to_video\` — animate a still image

- Single profile (\`motion\`); guided motion control from a still.
- Required: \`source\` (or \`sourceUrl\`) of the still image.
- Convenience fields: \`prompt\`, \`aspectRatio\`.
- Useful \`input\` hints: \`duration\` (seconds), camera/motion controls.

\`\`\`bash
curl -X POST "$STELLA_API/api/media/v1/generate" \\
  -H "Authorization: Bearer $STELLA_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "capability": "image_to_video",
    "prompt": "slow cinematic push-in",
    "aspectRatio": "16:9",
    "source": "data:image/png;base64,<base64>",
    "input": { "duration": 5 }
  }'
\`\`\`

### \`video_extend\` — continue an existing video

- Single profile (\`default\`).
- Required: \`source\` (or \`sourceUrl\`) of the input video.
- Useful \`input\` hints: \`prompt\`, \`aspectRatio\`, target duration.

### \`video_to_video\` — transform a video

- Profiles: \`reference\` (default; reference-guided transformation), \`edit\` (instruction-driven editing).
- Required: \`source\` (or \`sourceUrl\`) of the input video.
- Convenience fields: \`prompt\`, \`aspectRatio\`.
- Useful \`input\` hints: reference strength, style controls.

## Notes for agents

- Video jobs are slow (tens of seconds to minutes). After submitting, give the
  user a one-line "I've kicked off the video render" and move on — the
  Display sidebar will open with the finished clip when it's ready.
- The materializer writes the output to \`state/media/outputs/<jobId>_0.<ext>\`.
`.trim();

const SECTION_AUDIO = `
## Capabilities

### \`text_to_dialogue\` — speak a script

- Single profile (\`default\`).
- Convenience field: \`prompt\` is mapped to the provider's \`text\` field.
- Useful \`input\` hints: voice settings, speaker mapping for multi-voice scripts.

\`\`\`bash
curl -X POST "$STELLA_API/api/media/v1/generate" \\
  -H "Authorization: Bearer $STELLA_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "capability": "text_to_dialogue",
    "prompt": "Welcome to Stella. How can I help today?"
  }'
\`\`\`

### \`sound_effects\` — Foley / sfx from text

- Single profile (\`default\`).
- Convenience field: \`prompt\` → provider \`text\`.
- Required \`input\` hint: \`duration_seconds\` (gateway requires it for billing).

### \`speech_to_text\` — transcribe audio

- Single profile (\`default\`).
- Required: \`source\` (or \`sourceUrl\`) of the audio file.
- Output includes \`text\`, segments, and detected language.

### \`audio_visual_separate\` — isolate audio guided by video

- Single profile (\`default\`).
- Required inputs go in \`sources\`: \`{ "video": "data:...", "audio": "data:..." }\`.
- Output: separated stems / tracks.

## Notes for agents

- Audio outputs land in \`state/media/outputs/\` as \`.mp3\` / \`.wav\` and play
  inline in the Display sidebar — no need to manage playback yourself.
- For long transcriptions, the provider may take a while; keep the user
  updated only if the job is still pending after ~30s.
`.trim();

const SECTION_MUSIC = `
## Capabilities

### \`text_to_music\` — generate a short music clip

- Single profile (\`default\`); Google Lyria 3 Pro preview.
- Convenience field: \`prompt\` becomes a single weighted prompt if \`weightedPrompts\` is not supplied.
- Useful \`input\` fields: \`promptLabel\`, \`weightedPrompts\`, \`musicGenerationConfig\`.
- \`musicGenerationConfig\` fields: \`bpm\` (55–145), \`density\` (0.05–0.9), \`brightness\` (0.1–0.8), \`guidance\` (2–5), \`temperature\` (0.6–1.4), optional \`musicGenerationMode: "VOCALIZATION"\`.

\`\`\`bash
curl -X POST "$STELLA_API/api/media/v1/generate" \\
  -H "Authorization: Bearer $STELLA_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "capability": "text_to_music",
    "prompt": "warm lo-fi keys, soft vinyl texture, gentle drums",
    "input": {
      "promptLabel": "Rainy tape",
      "musicGenerationConfig": {
        "bpm": 85,
        "density": 0.5,
        "brightness": 0.4,
        "guidance": 4,
        "temperature": 1.1
      }
    }
  }'
\`\`\`

For more control, pass explicit weighted prompts:

\`\`\`json
{
  "capability": "text_to_music",
  "input": {
    "promptLabel": "Neon focus",
    "weightedPrompts": [
      { "text": "steady ambient electronica with soft arpeggios", "weight": 1 },
      { "text": "harsh distorted guitars", "weight": -0.6 }
    ],
    "musicGenerationConfig": {
      "bpm": 104,
      "density": 0.45,
      "brightness": 0.5,
      "guidance": 4,
      "temperature": 1
    }
  }
}
\`\`\`

## Notes for agents

- Music jobs return a normal media job and also materialize into \`state/media/outputs/\`.
- The generated clip is about 30 seconds. Use \`musicGenerationMode: "VOCALIZATION"\` only when the user asks for sung elements; otherwise keep it instrumental.
- Do not use real artist names, song titles, or copyrighted material in the prompt.
`.trim();

const SECTION_3D = `
## Capabilities

### \`text_to_3d\` — generate a 3D asset

- Single profile (\`default\`).
- Convenience field: \`prompt\`.
- Useful \`input\` hints: optional reference images via \`sources\` if you want shape guidance.

\`\`\`bash
curl -X POST "$STELLA_API/api/media/v1/generate" \\
  -H "Authorization: Bearer $STELLA_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "capability": "text_to_3d",
    "prompt": "a low-poly stylized fox, neutral pose"
  }'
\`\`\`

## Notes for agents

- Output is a 3D asset URL (typically \`.glb\` or similar). The Display sidebar
  shows it as a downloadable card with a label — the user can open it in any
  3D viewer they prefer. You don't need to convert formats yourself.
`.trim();

const SECTIONS: Record<MediaDocsKind, string> = {
  images: SECTION_IMAGES,
  video: SECTION_VIDEO,
  audio: SECTION_AUDIO,
  music: SECTION_MUSIC,
  "3d": SECTION_3D,
};

const KIND_TITLES: Record<MediaDocsKind, string> = {
  images: "Stella Managed Media — Images",
  video: "Stella Managed Media — Video",
  audio: "Stella Managed Media — Audio",
  music: "Stella Managed Media — Music",
  "3d": "Stella Managed Media — 3D",
};

export const renderMediaDocsForKind = (kind: MediaDocsKind): string =>
  [
    renderHeader(
      KIND_TITLES[kind],
      `Capabilities for ${KIND_DESCRIPTIONS[kind]}.`,
    ),
    "",
    SECTIONS[kind],
    "",
    SHARED_CONTRACT,
  ].join("\n");
