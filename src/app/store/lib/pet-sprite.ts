export const PET_COLUMNS = 8;
export const PET_ROWS = 9;

export type PetAnimationState =
  | "idle"
  | "running-right"
  | "running-left"
  | "waving"
  | "jumping"
  | "failed"
  | "waiting"
  | "running"
  | "review";

type SpriteFrame = {
  rowIndex: number;
  columnIndex: number;
  frameDurationMs: number;
};

export const ANIMATION_STATES: ReadonlyArray<{
  state: PetAnimationState;
  label: string;
}> = [
  { state: "idle", label: "Idle" },
  { state: "running-right", label: "Run right" },
  { state: "running-left", label: "Run left" },
  { state: "waving", label: "Waving" },
  { state: "jumping", label: "Jumping" },
  { state: "failed", label: "Failed" },
  { state: "waiting", label: "Waiting" },
  { state: "running", label: "Running" },
  { state: "review", label: "Review" },
];

export const IDLE_BASE: SpriteFrame[] = [
  { rowIndex: 0, columnIndex: 0, frameDurationMs: 280 },
  { rowIndex: 0, columnIndex: 1, frameDurationMs: 110 },
  { rowIndex: 0, columnIndex: 2, frameDurationMs: 110 },
  { rowIndex: 0, columnIndex: 3, frameDurationMs: 140 },
  { rowIndex: 0, columnIndex: 4, frameDurationMs: 140 },
  { rowIndex: 0, columnIndex: 5, frameDurationMs: 320 },
];

export const IDLE_REST: SpriteFrame[] = IDLE_BASE.map((frame) => ({
  ...frame,
  frameDurationMs: frame.frameDurationMs * 6,
}));

export const buildAnimationRow = (
  rowIndex: number,
  frameCount: number,
  frameDurationMs: number,
  finalFrameDurationMs: number,
): SpriteFrame[] =>
  Array.from({ length: frameCount }, (_unused, columnIndex) => ({
    rowIndex,
    columnIndex,
    frameDurationMs:
      columnIndex === frameCount - 1 ? finalFrameDurationMs : frameDurationMs,
  }));

export const PET_ANIMATIONS: Record<PetAnimationState, SpriteFrame[]> = {
  idle: IDLE_BASE,
  jumping: buildAnimationRow(4, 5, 140, 280),
  review: buildAnimationRow(8, 6, 150, 280),
  running: buildAnimationRow(7, 6, 120, 220),
  "running-left": buildAnimationRow(2, 8, 120, 220),
  "running-right": buildAnimationRow(1, 8, 120, 220),
  waving: buildAnimationRow(3, 4, 140, 280),
  waiting: buildAnimationRow(6, 6, 150, 260),
  failed: buildAnimationRow(5, 8, 140, 240),
};

export const formatPetFramePosition = (frame: SpriteFrame): string => {
  const x = (frame.columnIndex / (PET_COLUMNS - 1)) * 100;
  const y = (frame.rowIndex / (PET_ROWS - 1)) * 100;
  return `${x}% ${y}%`;
};

export const resolvePetAnimation = (
  state: PetAnimationState,
  continuous: boolean,
): { frames: SpriteFrame[]; loopStartIndex: number | null } => {
  if (state === "idle") return { frames: IDLE_REST, loopStartIndex: 0 };
  const baseFrames = PET_ANIMATIONS[state];
  if (continuous) return { frames: baseFrames, loopStartIndex: 0 };
  const reactive = [...baseFrames, ...baseFrames, ...baseFrames];
  return { frames: [...reactive, ...IDLE_REST], loopStartIndex: reactive.length };
};

export const downloadCountFormatter = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatDownloads = (value: number): string =>
  downloadCountFormatter.format(Math.max(0, Math.floor(value)));

export const formatEmojiUseCount = (count: number | undefined): string | null => {
  const n = count ?? 0;
  if (n <= 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M uses`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K uses`;
  return `${n} use${n === 1 ? "" : "s"}`;
};
