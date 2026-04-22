"use client";

import { memo } from "react";
import Stone from "./Stone";

interface PitProps {
  pitIndex: number;
  stoneCount: number;
  isStore?: boolean;
  isOwner?: boolean;
  isPlayable?: boolean;
  isActiveSide?: boolean;
  highlightFlash?: "capture-source" | "capture-opposite" | "last-drop" | null;
  onClick?: () => void;
  label?: string;
}

function Pit({
  pitIndex,
  stoneCount,
  isStore = false,
  isOwner = false,
  isPlayable = false,
  isActiveSide = false,
  highlightFlash = null,
  onClick,
  label,
}: PitProps) {
  const stones = Array.from({ length: Math.min(stoneCount, 48) }, (_, i) => i);
  const overflow = stoneCount > 48 ? stoneCount - 48 : 0;

  const base = isStore ? "pit pit-store" : "pit pit-regular";
  const owner = isOwner ? "pit-own" : "";
  const playable = isPlayable ? "pit-playable" : "";
  const activeSide = isActiveSide && !isPlayable ? "pit-active-side" : "";
  const flash = highlightFlash ? `pit-flash-${highlightFlash}` : "";

  const Comp = isPlayable ? "button" : "div";

  return (
    <Comp
      type={isPlayable ? "button" : undefined}
      onClick={isPlayable ? onClick : undefined}
      disabled={isPlayable ? false : undefined}
      aria-label={
        label ?? (isStore ? `Store, ${stoneCount} stones` : `Pit ${pitIndex}, ${stoneCount} stones`)
      }
      className={`${base} ${owner} ${playable} ${activeSide} ${flash}`.trim()}
      data-pit={pitIndex}
    >
      <span className="pit-count" aria-hidden>
        {stoneCount}
      </span>
      <div className="pit-stones" aria-hidden>
        {stones.map((i) => (
          <Stone key={i} seed={pitIndex} index={i} />
        ))}
        {overflow > 0 && (
          <span className="pit-overflow">+{overflow}</span>
        )}
      </div>
    </Comp>
  );
}

export default memo(Pit);
