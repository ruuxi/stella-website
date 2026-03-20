import type { BlobColors } from "@/components/stella-demos/radial-blob";
import { RADIAL_VECTOR_PALETTE, RADIAL_WEDGES } from "./data";
import type { RadialWedge } from "./types";

export type RadialLayoutEntry = RadialWedge & {
  path: string;
  position: { x: number; y: number };
};

export const RADIAL_SIZE = 280;
export const RADIAL_CENTER = RADIAL_SIZE / 2;
const INNER_RADIUS = 40;
const OUTER_RADIUS = 125;
const WEDGE_ANGLE = 72;

export function createWedgePath(startAngle: number, endAngle: number): string {
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);

  const x1 = RADIAL_CENTER + INNER_RADIUS * Math.cos(startRad);
  const y1 = RADIAL_CENTER + INNER_RADIUS * Math.sin(startRad);
  const x2 = RADIAL_CENTER + OUTER_RADIUS * Math.cos(startRad);
  const y2 = RADIAL_CENTER + OUTER_RADIUS * Math.sin(startRad);
  const x3 = RADIAL_CENTER + OUTER_RADIUS * Math.cos(endRad);
  const y3 = RADIAL_CENTER + OUTER_RADIUS * Math.sin(endRad);
  const x4 = RADIAL_CENTER + INNER_RADIUS * Math.cos(endRad);
  const y4 = RADIAL_CENTER + INNER_RADIUS * Math.sin(endRad);

  return `
    M ${x1} ${y1}
    L ${x2} ${y2}
    A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 0 1 ${x3} ${y3}
    L ${x4} ${y4}
    A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${x1} ${y1}
    Z
  `;
}

function getContentPosition(index: number) {
  const midAngle = (index * WEDGE_ANGLE + WEDGE_ANGLE / 2 - 90) * (Math.PI / 180);
  const contentRadius = (INNER_RADIUS + OUTER_RADIUS) / 2;
  return {
    x: RADIAL_CENTER + contentRadius * Math.cos(midAngle),
    y: RADIAL_CENTER + contentRadius * Math.sin(midAngle),
  };
}

export const RADIAL_LAYOUT: RadialLayoutEntry[] = RADIAL_WEDGES.map((wedge, index) => ({
  ...wedge,
  path: createWedgePath(index * WEDGE_ANGLE, (index + 1) * WEDGE_ANGLE),
  position: getContentPosition(index),
}));

export function createBlobColors(selectedIndex: number): BlobColors {
  return {
    fills: RADIAL_WEDGES.map((_, index) =>
      index === selectedIndex ? RADIAL_VECTOR_PALETTE.selected : RADIAL_VECTOR_PALETTE.base,
    ),
    selectedFill: RADIAL_VECTOR_PALETTE.selected,
    centerBg: RADIAL_VECTOR_PALETTE.center,
    stroke: RADIAL_VECTOR_PALETTE.stroke,
  };
}

export const CENTER_BG_RADIUS = INNER_RADIUS - 5;
