"use client";

import { memo } from "react";
import Pit from "./Pit";
import {
  P1_PITS,
  P1_STORE,
  P2_PITS,
  P2_STORE,
  type GameState,
  type Player,
} from "@/lib/mancala";

interface BoardProps {
  state: GameState;
  displayBoard: number[];
  validMoves: number[];
  onPitClick: (pit: number) => void;
  humanPlayer: Player | "both";
  currentAnimatingPit: number | null;
  flashPits: Map<number, "capture-source" | "capture-opposite" | "last-drop">;
  aiThinking: boolean;
}

function Board({
  state,
  displayBoard,
  validMoves,
  onPitClick,
  humanPlayer,
  currentAnimatingPit,
  flashPits,
  aiThinking,
}: BoardProps) {
  const humanCanMoveNow =
    !state.gameOver &&
    currentAnimatingPit === null &&
    !aiThinking &&
    (humanPlayer === "both" || humanPlayer === state.currentPlayer);

  const isPlayable = (pit: number) =>
    humanCanMoveNow && validMoves.includes(pit);

  const topRow = [...P2_PITS].reverse();

  return (
    <div className="board-wrapper">
      <div className="board">
        <div className="store-left">
          <Pit
            pitIndex={P2_STORE}
            stoneCount={displayBoard[P2_STORE]}
            isStore
            isOwner={false}
            isActiveSide={state.currentPlayer === 1}
            highlightFlash={flashPits.get(P2_STORE) ?? null}
            label={`Player 2 store, ${displayBoard[P2_STORE]} stones`}
          />
          <div className="store-label">P2</div>
        </div>

        <div className="pits-grid">
          <div className="pits-row pits-row-top">
            {topRow.map((p) => (
              <Pit
                key={p}
                pitIndex={p}
                stoneCount={displayBoard[p]}
                isOwner={false}
                isPlayable={isPlayable(p)}
                isActiveSide={state.currentPlayer === 1}
                highlightFlash={flashPits.get(p) ?? null}
                onClick={() => onPitClick(p)}
                label={`Player 2, pit ${12 - p + 1}, ${displayBoard[p]} stones`}
              />
            ))}
          </div>
          <div className="pits-row pits-row-bottom">
            {P1_PITS.map((p) => (
              <Pit
                key={p}
                pitIndex={p}
                stoneCount={displayBoard[p]}
                isOwner
                isPlayable={isPlayable(p)}
                isActiveSide={state.currentPlayer === 0}
                highlightFlash={flashPits.get(p) ?? null}
                onClick={() => onPitClick(p)}
                label={`Player 1, pit ${p + 1}, ${displayBoard[p]} stones`}
              />
            ))}
          </div>
        </div>

        <div className="store-right">
          <Pit
            pitIndex={P1_STORE}
            stoneCount={displayBoard[P1_STORE]}
            isStore
            isOwner
            isActiveSide={state.currentPlayer === 0}
            highlightFlash={flashPits.get(P1_STORE) ?? null}
            label={`Player 1 store, ${displayBoard[P1_STORE]} stones`}
          />
          <div className="store-label">P1</div>
        </div>
      </div>
    </div>
  );
}

export default memo(Board);
