"use client";

import { memo } from "react";

interface StoneProps {
  seed: number;
  index: number;
  highlighted?: boolean;
}

const COLORS = [
  "radial-gradient(circle at 35% 30%, #fde68a, #b45309 70%, #78350f)",
  "radial-gradient(circle at 35% 30%, #fef3c7, #a16207 70%, #713f12)",
  "radial-gradient(circle at 35% 30%, #fed7aa, #c2410c 70%, #7c2d12)",
  "radial-gradient(circle at 35% 30%, #e7e5e4, #78716c 70%, #292524)",
  "radial-gradient(circle at 35% 30%, #fcd34d, #92400e 70%, #451a03)",
  "radial-gradient(circle at 35% 30%, #fef08a, #854d0e 70%, #422006)",
];

function hash(a: number, b: number): number {
  let x = (a * 2654435761 + b * 40503) | 0;
  x ^= x >>> 13;
  x = Math.imul(x, 0x5bd1e995);
  x ^= x >>> 15;
  return (x >>> 0) / 0xffffffff;
}

function Stone({ seed, index, highlighted = false }: StoneProps) {
  const r1 = hash(seed, index * 7 + 1);
  const r2 = hash(seed, index * 7 + 2);
  const r3 = hash(seed, index * 7 + 3);
  const r4 = hash(seed, index * 7 + 4);

  const colorIdx = Math.floor(r4 * COLORS.length);
  const bg = COLORS[colorIdx];
  const left = 20 + r1 * 60;
  const top = 20 + r2 * 60;
  const rot = r3 * 360;
  const size = 18 + r4 * 6;

  return (
    <span
      aria-hidden
      className="stone"
      style={{
        background: bg,
        left: `${left}%`,
        top: `${top}%`,
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(-50%, -50%) rotate(${rot}deg)`,
        boxShadow: highlighted
          ? "0 0 12px rgba(253, 224, 71, 0.95), 0 2px 4px rgba(0,0,0,0.4)"
          : "inset -2px -3px 6px rgba(0,0,0,0.35), inset 2px 2px 4px rgba(255,255,255,0.25), 0 2px 3px rgba(0,0,0,0.4)",
      }}
    />
  );
}

export default memo(Stone);
