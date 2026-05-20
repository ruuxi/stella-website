// Deterministic gradient picker — same palette as desktop's StoreView.
export const GRADIENTS = [
  "linear-gradient(135deg, oklch(0.72 0.15 25), oklch(0.58 0.20 50))",
  "linear-gradient(135deg, oklch(0.68 0.13 205), oklch(0.52 0.17 230))",
  "linear-gradient(135deg, oklch(0.70 0.15 145), oklch(0.55 0.18 170))",
  "linear-gradient(135deg, oklch(0.68 0.16 280), oklch(0.52 0.20 305))",
  "linear-gradient(135deg, oklch(0.73 0.12 80), oklch(0.60 0.16 55))",
  "linear-gradient(135deg, oklch(0.66 0.17 340), oklch(0.52 0.22 10))",
  "linear-gradient(135deg, oklch(0.66 0.11 215), oklch(0.50 0.15 240))",
  "linear-gradient(135deg, oklch(0.70 0.14 165), oklch(0.54 0.17 190))",
];

export function hashString(value: string): number {
  let h = 0;
  for (const ch of value) h = ((h << 5) - h + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function getGradient(name: string): string {
  return GRADIENTS[hashString(name) % GRADIENTS.length]!;
}

export function getInitial(name: string): string {
  return (name.trim()[0] ?? "S").toUpperCase();
}
