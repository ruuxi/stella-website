"use client";

import { useEffect, useRef } from "react";
import type { PublicPet, UserPetRecord, UserPetUploadTarget } from "./types";
import { readConvexSiteUrl } from "@/lib/convex-urls";
import { getStoreAuthToken } from "./bridge";
import {
  PET_COLUMNS,
  PET_ROWS,
  formatPetFramePosition,
  resolvePetAnimation,
  type PetAnimationState,
} from "./pet-sprite";

export function PetSprite({
  spritesheetUrl,
  size = 84,
  state = "idle",
  continuous = false,
}: {
  spritesheetUrl: string;
  size?: number;
  state?: PetAnimationState;
  continuous?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const { frames, loopStartIndex } = resolvePetAnimation(state, continuous);
    let frameIndex = 0;
    let timer: number | null = null;

    const applyFrame = () => {
      const frame = frames[frameIndex];
      if (!frame) return;
      node.style.backgroundPosition = formatPetFramePosition(frame);
    };

    applyFrame();
    if (frames.length <= 1) return;

    const tick = () => {
      timer = window.setTimeout(() => {
        const next = frameIndex + 1;
        if (next >= frames.length) {
          if (loopStartIndex != null) {
            frameIndex = loopStartIndex;
            applyFrame();
            tick();
          }
          return;
        }
        frameIndex = next;
        applyFrame();
        tick();
      }, frames[frameIndex]?.frameDurationMs ?? 160);
    };

    tick();
    return () => {
      if (timer != null) window.clearTimeout(timer);
    };
  }, [continuous, size, spritesheetUrl, state]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-pet-state={state}
      style={{
        width: size,
        height: Math.round(size * (208 / 192)),
        backgroundImage: `url(${spritesheetUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${PET_COLUMNS * 100}% ${PET_ROWS * 100}%`,
        backgroundPosition: "0% 0%",
        imageRendering: "pixelated",
      }}
    />
  );
}

export type UserPetSpritesheetBlob = {
  blob: Blob;
  sha256: string;
  objectUrl: string;
  warnings: string[];
  preview: UserPetPreviewBlob | null;
};

type UserPetPreviewBlob = {
  blob: Blob;
  sha256: string;
  objectUrl: string;
};

export const USER_PET_ATLAS = {
  width: 2560,
  height: 3240,
  columns: 8,
  rows: 9,
  cellWidth: 320,
  cellHeight: 360,
  chroma: "#00ff00",
} as const;

export const PREVIEW_STRIP = {
  width: 640,
  height: 90,
} as const;

export const PET_GENERATION_ROWS = [
  {
    state: "idle",
    intent:
      "ambient breathing loop spread across all eight cells. Subtle chest/head movement only; no walking or waving.",
  },
  {
    state: "running-right",
    intent:
      "facing right, scampering across all eight cells. Body and limbs in motion; no speed lines, dust, or shadows.",
  },
  {
    state: "running-left",
    intent:
      "facing left, scampering across all eight cells, mirrored from running-right when symmetric. No speed lines, dust, or shadows.",
  },
  {
    state: "waving",
    intent:
      "warm greeting paw wave spread across all eight cells. Convey through paw pose only; no wave marks, motion arcs, sparkles, or symbols.",
  },
  {
    state: "jumping",
    intent:
      "vertical hop arc spread across all eight cells. Convey through body position only; no shadows, dust, landing marks, or impact bursts.",
  },
  {
    state: "failed",
    intent:
      "dizzy, shocked, or shaken reaction across all eight cells. Attached opaque tears, stars, or smoke puffs may overlap the silhouette; no detached symbols.",
  },
  {
    state: "waiting",
    intent:
      "polite needs-input loop across all eight cells. Looking up, tapping, or glancing; no question marks or thought bubbles.",
  },
  {
    state: "success",
    intent:
      "happy celebratory loop across all eight cells. Use pose and face only; no confetti, sparkles, floating hearts, or detached props.",
  },
  {
    state: "review",
    intent:
      "focused review loop across all eight cells. Lean, blink, eye direction, head tilt, or paw position; no papers, code, UI, or punctuation.",
  },
] as const;

export const buildUserPetAtlasPrompt = (description: string): string => {
  const rowsTable = PET_GENERATION_ROWS.map(
    (row, index) => `| ${index} | ${row.state.padEnd(13)} | ${row.intent}`,
  ).join("\n");
  return `# Stella pet sprite atlas - Custom Pet

Generate a single ${USER_PET_ATLAS.width} x ${USER_PET_ATLAS.height} sprite sheet of the same pet performing nine animation states.

## Layout

- The image is exactly ${USER_PET_ATLAS.width} x ${USER_PET_ATLAS.height} pixels.
- ${USER_PET_ATLAS.rows} rows x ${USER_PET_ATLAS.columns} columns of ${USER_PET_ATLAS.cellWidth} x ${USER_PET_ATLAS.cellHeight} cells.
- Every row contains exactly ${USER_PET_ATLAS.columns} frames. Frames within each row read left to right.
- Each pet silhouette fits fully inside its single cell with breathing room on all sides. No silhouette crosses into a neighboring cell.

## Rows

| row | state         | animation intent
| --- | ------------- | ----------------
${rowsTable}

## Pet identity

${description.trim() || "A friendly Stella mascot pet."}

Identity must stay consistent across every cell: same head shape, face, markings, palette, prop, outline weight, and body proportions.

## Style

Small pixel-art-adjacent mascot. Chunky readable silhouette. Thick dark 1-2 px outline. Visible stepped pixel edges. Limited palette. Flat cel shading. Simple expressive face. Tiny limbs.

## Background

Background everywhere outside the pet silhouette is a single flat ${USER_PET_ATLAS.chroma} (true RGB, no gradient, no noise, no other green tones in the pet). The same ${USER_PET_ATLAS.chroma} fills the gutters between cells.

## Forbidden

- No detached effects, shadows, labels, frame numbers, captions, speech bubbles, thought bubbles, UI, code, punctuation marks, watermarks, or grid guidelines.
- No chroma-key-adjacent colors inside the pet, prop, or any allowed attached effect.
- No silhouette crossing into a neighboring cell. Scale the silhouette down when needed.`;
};

export const getServiceAuthHeaders = async (headers: Record<string, string>) => {
  const token = await getStoreAuthToken();
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
};

export const submitUserPetAtlasJob = async (
  description: string,
): Promise<{ jobId: string }> => {
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
      capability: "text_to_image",
      profile: "best",
      prompt: buildUserPetAtlasPrompt(description),
      input: {
        image_size: {
          width: USER_PET_ATLAS.width,
          height: USER_PET_ATLAS.height,
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

export const extractFirstImageUrl = (output: unknown): string | null => {
  if (!output || typeof output !== "object") return null;
  const images = (output as { images?: Array<{ url?: string }> }).images;
  if (!Array.isArray(images)) return null;
  for (const entry of images) {
    if (entry?.url) return entry.url;
  }
  return null;
};

export const blobToWebP = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob returned null"))),
      "image/webp",
      0.92,
    );
  });

export const sha256Hex = async (blob: Blob): Promise<string> => {
  const buffer = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const keyChromaToAlpha = (imageData: ImageData): void => {
  const pixels = imageData.data;
  const key = { r: 0, g: 255, b: 0 };
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

export const buildIdlePreviewStrip = async (
  atlasCanvas: HTMLCanvasElement,
): Promise<UserPetPreviewBlob> => {
  const previewCanvas = document.createElement("canvas");
  previewCanvas.width = PREVIEW_STRIP.width;
  previewCanvas.height = PREVIEW_STRIP.height;
  const ctx = previewCanvas.getContext("2d");
  if (!ctx) throw new Error("Canvas2D unavailable for preview");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    atlasCanvas,
    0,
    0,
    USER_PET_ATLAS.cellWidth * USER_PET_ATLAS.columns,
    USER_PET_ATLAS.cellHeight,
    0,
    0,
    PREVIEW_STRIP.width,
    PREVIEW_STRIP.height,
  );
  const blob = await blobToWebP(previewCanvas);
  return {
    blob,
    sha256: await sha256Hex(blob),
    objectUrl: URL.createObjectURL(blob),
  };
};

export const processUserPetAtlasImage = async (
  imageUrl: string,
): Promise<UserPetSpritesheetBlob> => {
  const warnings: string[] = [];
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Image download failed (${response.status})`);
  const bitmap = await createImageBitmap(await response.blob());
  if (
    bitmap.width !== USER_PET_ATLAS.width ||
    bitmap.height !== USER_PET_ATLAS.height
  ) {
    warnings.push(
      `Generated atlas was ${bitmap.width}x${bitmap.height}; resized to ${USER_PET_ATLAS.width}x${USER_PET_ATLAS.height}.`,
    );
  }
  const canvas = document.createElement("canvas");
  canvas.width = USER_PET_ATLAS.width;
  canvas.height = USER_PET_ATLAS.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas2D unavailable");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  keyChromaToAlpha(imageData);
  ctx.putImageData(imageData, 0, 0);
  const blob = await blobToWebP(canvas);
  return {
    blob,
    sha256: await sha256Hex(blob),
    objectUrl: URL.createObjectURL(blob),
    warnings,
    preview: await buildIdlePreviewStrip(canvas).catch(() => null),
  };
};

export const uploadUserPetSpritesheetToR2 = async (
  blob: Blob,
  target: UserPetUploadTarget,
): Promise<void> => {
  const response = await fetch(target.putUrl, {
    method: "PUT",
    headers: target.headers,
    body: blob,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Pet upload failed (${response.status})${text ? `: ${text}` : ""}`,
    );
  }
};

export const buildUserPetId = (): string =>
  `pet-${Date.now().toString(36).slice(-6)}`;

export const userPetToPublicPet = (pet: UserPetRecord): PublicPet => ({
  id: pet.petId,
  displayName: pet.displayName,
  description: pet.description,
  kind: "custom",
  tags: pet.tags ?? ["custom"],
  ownerName: pet.authorUsername ? `@${pet.authorUsername}` : null,
  spritesheetUrl: pet.spritesheetUrl,
  ...(pet.previewUrl ? { previewUrl: pet.previewUrl } : {}),
  downloads: pet.installCount ?? 0,
});
