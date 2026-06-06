"use client";

import { readConvexSiteUrl } from "@/lib/convex-urls";
import type { EmojiPackUploadTarget } from "./types";
import {
  blobToWebP,
  extractFirstImageUrl,
  getServiceAuthHeaders,
  sha256Hex,
} from "./pet-media";

export const EMOJI_SHEET_GRID_SIZE = 6;
export const EMOJI_SHEET_SIZE = 768;
export const EMOJI_CELL_SIZE = EMOJI_SHEET_SIZE / EMOJI_SHEET_GRID_SIZE;
export const EMOJI_CHROMA = "#ff00ff";

export const EMOJI_SHEETS: readonly (readonly string[])[] = [
  [
    "😀", "😃", "😄", "😁", "😆", "😊",
    "🙂", "😉", "😍", "🥰", "😘", "😎",
    "🤩", "🥳", "😋", "🤗", "🤔", "😅",
    "🙄", "😐", "😑", "😶", "🫡", "🤨",
    "😂", "🤣", "😭", "😢", "😡", "😠",
    "😱", "🥺", "😇", "🤓", "😏", "😬",
  ],
  [
    "🤐", "🤫", "🤥", "🤪", "😔", "😕",
    "😣", "😤", "😥", "😨", "😰", "😪",
    "👍", "👌", "🙏", "👋", "🙌", "💪",
    "👏", "✌️", "👎", "✋", "🤝", "🫶",
    "🤞", "☝️", "👀", "🧠", "🤘", "🤙",
    "🫰", "🫵", "🖐️", "🤲", "🫳", "🫴",
  ],
  [
    "💀", "🗿", "🤡", "💅", "🙃", "🥹",
    "🫠", "🫥", "🫨", "😵‍💫", "🥴", "😩",
    "🥵", "🥶", "😳", "😈", "🤤", "😴",
    "🥲", "😮‍💨", "🥱", "🤢", "🤮", "🙈",
    "🤌", "🤳", "🫦", "🧢", "🐐", "👑",
    "🤠", "🥸", "💸", "🌈", "⚡", "🥀",
  ],
];

type RGB = { r: number; g: number; b: number };

export type EmojiSheetBlob = {
  blob: Blob;
  sha256: string;
  objectUrl: string;
  warnings: string[];
};

const DEFAULT_STYLE = "playful party style";

export const buildEmojiPackId = (): string =>
  `emoji-${Date.now().toString(36).slice(-6)}`;

export const buildEmojiSheetEditPrompt = (style: string): string => {
  const theme = style.trim() || DEFAULT_STYLE;
  return [
    `Edit the reference image into a custom emoji sheet styled entirely as: "${theme}".`,
    "Replace every reference emoji glyph with fully original artwork in that style. Keep the same meaning, cell position, relative scale, and row-major order shown in the reference image.",
    "The reference image is a positional and semantic guide only. Do not copy default Apple, Google, Microsoft, Samsung, Twemoji, or system emoji rendering.",
    `Theme reminder: "${theme}". Apply it to every cell: linework, palette, shading, mood, and character design must all read as that theme.`,
    "",
    "Layout:",
    `- Output a single square image as a ${EMOJI_SHEET_GRID_SIZE}x${EMOJI_SHEET_GRID_SIZE} layout of cells.`,
    "- Cells are perfectly uniform in size with consistent padding.",
    "- Each icon is fully contained inside its cell, centered, with breathing room.",
    "- Preserve the reference image's positions exactly: top-left stays top-left and bottom-right stays bottom-right.",
    "",
    "Background:",
    `- Preserve the reference image's existing ${EMOJI_CHROMA} background exactly wherever there is no icon.`,
    `- The gutters between cells must remain the same flat ${EMOJI_CHROMA} chroma key (true RGB, no gradient, no noise, no texture).`,
    "- Do not use magenta or magenta-adjacent colors inside any icon.",
    "",
    "Forbidden:",
    "- Default platform emoji rendering of any kind.",
    "- Borders, frame lines, grid lines, labels, captions, watermarks, signatures, or text anywhere on the canvas.",
    "- Decorative confetti, sparkles, particles, motion lines, or background props that do not belong to the icon itself.",
    "- Icons crossing into neighboring cells.",
  ].join("\n");
};

export const buildEmojiReferenceSheetDataUrl = (sheetIndex: number): string => {
  const sheet = EMOJI_SHEETS[sheetIndex];
  if (!sheet) throw new Error(`Unknown emoji sheet ${sheetIndex + 1}`);
  const canvas = document.createElement("canvas");
  canvas.width = EMOJI_SHEET_SIZE;
  canvas.height = EMOJI_SHEET_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas2D unavailable");
  ctx.fillStyle = EMOJI_CHROMA;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font =
    '76px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  sheet.forEach((emoji, index) => {
    const row = Math.floor(index / EMOJI_SHEET_GRID_SIZE);
    const col = index % EMOJI_SHEET_GRID_SIZE;
    ctx.fillText(
      emoji,
      col * EMOJI_CELL_SIZE + EMOJI_CELL_SIZE / 2,
      row * EMOJI_CELL_SIZE + EMOJI_CELL_SIZE / 2 + 2,
    );
  });
  return canvas.toDataURL("image/png");
};

export const submitEmojiSheetJob = async (args: {
  sheetIndex: number;
  style: string;
}): Promise<{ jobId: string }> => {
  const endpoint = new URL(
    "/api/media/v1/generate",
    readConvexSiteUrl(),
  ).toString();
  const headers = await getServiceAuthHeaders({
    "Content-Type": "application/json",
  });
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      capability: "image_edit",
      profile: "default",
      prompt: buildEmojiSheetEditPrompt(args.style),
      input: {
        image_urls: [buildEmojiReferenceSheetDataUrl(args.sheetIndex)],
        image_size: {
          width: EMOJI_SHEET_SIZE,
          height: EMOJI_SHEET_SIZE,
        },
        quality: "medium",
        output_format: "png",
      },
    }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Generation failed (${response.status})${text ? `: ${text}` : ""}`,
    );
  }
  const json = (await response.json()) as { jobId?: string };
  if (!json.jobId) throw new Error("Generation response missing jobId");
  return { jobId: json.jobId };
};

export const extractEmojiSheetUrl = extractFirstImageUrl;

const detectBorderColor = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  borderPx: number,
): RGB => {
  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];
  const sample = (x: number, y: number) => {
    const idx = (y * width + x) * 4;
    rs.push(pixels[idx]!);
    gs.push(pixels[idx + 1]!);
    bs.push(pixels[idx + 2]!);
  };
  for (let y = 0; y < borderPx; y += 1) {
    for (let x = 0; x < width; x += 1) sample(x, y);
  }
  for (let y = height - borderPx; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) sample(x, y);
  }
  for (let x = 0; x < borderPx; x += 1) {
    for (let y = borderPx; y < height - borderPx; y += 1) sample(x, y);
  }
  for (let x = width - borderPx; x < width; x += 1) {
    for (let y = borderPx; y < height - borderPx; y += 1) sample(x, y);
  }
  rs.sort((a, b) => a - b);
  gs.sort((a, b) => a - b);
  bs.sort((a, b) => a - b);
  const mid = Math.floor(rs.length / 2);
  return { r: rs[mid] ?? 255, g: gs[mid] ?? 0, b: bs[mid] ?? 255 };
};

const keyBackgroundToAlpha = (
  imageData: ImageData,
  warnings: string[],
): void => {
  const pixels = imageData.data;
  const key = detectBorderColor(pixels, imageData.width, imageData.height, 6);
  const expected = { r: 255, g: 0, b: 255 };
  const drift =
    Math.abs(key.r - expected.r) +
    Math.abs(key.g - expected.g) +
    Math.abs(key.b - expected.b);
  if (drift > 40) {
    warnings.push(
      `Detected chroma key rgb(${key.r}, ${key.g}, ${key.b}) instead of ${EMOJI_CHROMA}.`,
    );
  }
  for (let i = 0; i < pixels.length; i += 4) {
    const dr = pixels[i]! - key.r;
    const dg = pixels[i + 1]! - key.g;
    const db = pixels[i + 2]! - key.b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    if (dist <= 80) {
      pixels[i + 3] = 0;
    } else if (dist <= 130) {
      pixels[i + 3] = Math.round(255 * ((dist - 80) / 50));
    }
  }
};

const validateEmojiCells = (ctx: CanvasRenderingContext2D): string[] => {
  const warnings: string[] = [];
  for (let row = 0; row < EMOJI_SHEET_GRID_SIZE; row += 1) {
    for (let col = 0; col < EMOJI_SHEET_GRID_SIZE; col += 1) {
      const data = ctx.getImageData(
        col * EMOJI_CELL_SIZE,
        row * EMOJI_CELL_SIZE,
        EMOJI_CELL_SIZE,
        EMOJI_CELL_SIZE,
      ).data;
      let opaquePixels = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i]! > 24) opaquePixels += 1;
      }
      if (opaquePixels < 64) {
        warnings.push(`Cell ${row + 1}:${col + 1} appears empty.`);
      }
    }
  }
  return warnings;
};

export const processEmojiSheetImage = async (
  imageUrl: string,
): Promise<EmojiSheetBlob> => {
  const warnings: string[] = [];
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Image download failed (${response.status})`);
  const bitmap = await createImageBitmap(await response.blob());
  if (bitmap.width !== EMOJI_SHEET_SIZE || bitmap.height !== EMOJI_SHEET_SIZE) {
    warnings.push(
      `Generated sheet was ${bitmap.width}x${bitmap.height}; resized to ${EMOJI_SHEET_SIZE}x${EMOJI_SHEET_SIZE}.`,
    );
  }
  const canvas = document.createElement("canvas");
  canvas.width = EMOJI_SHEET_SIZE;
  canvas.height = EMOJI_SHEET_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas2D unavailable");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  keyBackgroundToAlpha(imageData, warnings);
  ctx.putImageData(imageData, 0, 0);
  warnings.push(...validateEmojiCells(ctx));
  const blob = await blobToWebP(canvas);
  return {
    blob,
    sha256: await sha256Hex(blob),
    objectUrl: URL.createObjectURL(blob),
    warnings,
  };
};

export const uploadEmojiSheetToR2 = async (
  blob: Blob,
  target: EmojiPackUploadTarget,
): Promise<void> => {
  const response = await fetch(target.putUrl, {
    method: "PUT",
    headers: target.headers,
    body: blob,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Emoji sheet upload failed (${response.status})${text ? `: ${text}` : ""}`,
    );
  }
};
