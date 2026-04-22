"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Board from "./Board";
import {
  applyMove,
  chooseAIMove,
  DIFFICULTY_DEPTH,
  initialState,
  P1_STORE,
  P2_STORE,
  validMoves as getValidMoves,
  type Difficulty,
  type GameState,
  type Player,
} from "@/lib/mancala";

type Mode = "human-vs-human" | "human-vs-ai";

type Toast = {
  id: number;
  message: string;
  variant: "capture" | "free-turn" | "win" | "info";
};

type Flash = Map<number, "capture-source" | "capture-opposite" | "last-drop">;

const STEP_MS = 260;
const CAPTURE_FLASH_MS = 900;

export default function Game() {
  const [mode, setMode] = useState<Mode>("human-vs-ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [humanPlaysAs, setHumanPlaysAs] = useState<Player>(0);

  const [state, setState] = useState<GameState>(() => initialState());
  const [displayBoard, setDisplayBoard] = useState<number[]>(() =>
    initialState().board,
  );
  const [animatingPit, setAnimatingPit] = useState<number | null>(null);
  const [flashPits, setFlashPits] = useState<Flash>(() => new Map());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [aiThinking, setAiThinking] = useState(false);

  const toastId = useRef(0);
  const busy = useRef(false);

  const pushToast = useCallback(
    (message: string, variant: Toast["variant"]) => {
      const id = ++toastId.current;
      setToasts((t) => [...t, { id, message, variant }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 2200);
    },
    [],
  );

  const aiPlayer: Player | null = useMemo(() => {
    if (mode !== "human-vs-ai") return null;
    return humanPlaysAs === 0 ? 1 : 0;
  }, [mode, humanPlaysAs]);

  const humanLabel = mode === "human-vs-human" ? "both" : humanPlaysAs;

  const validMovesForCurrent = useMemo(() => getValidMoves(state), [state]);

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  const runMove = useCallback(
    async (pitFromClickOrAI: number) => {
      if (busy.current) return;
      if (state.gameOver) return;
      busy.current = true;

      try {
        const snapshot = state;
        const result = applyMove(snapshot, pitFromClickOrAI);
        // Animate: start from snapshot board, pull stones out, then drop one at a time.
        const animBoard = [...snapshot.board];
        animBoard[pitFromClickOrAI] = 0;
        setAnimatingPit(pitFromClickOrAI);
        setDisplayBoard([...animBoard]);
        await sleep(STEP_MS * 0.7);

        for (const idx of result.path) {
          animBoard[idx] = (animBoard[idx] ?? 0) + 1;
          setDisplayBoard([...animBoard]);
          setFlashPits(() => {
            const m: Flash = new Map();
            m.set(idx, "last-drop");
            return m;
          });
          await sleep(STEP_MS);
        }

        // Handle capture visualization.
        if (result.captured) {
          const { pit: capPit, oppositePit: oppPit, total } = result.captured;
          setFlashPits(() => {
            const m: Flash = new Map();
            m.set(capPit, "capture-source");
            m.set(oppPit, "capture-opposite");
            return m;
          });
          await sleep(CAPTURE_FLASH_MS);

          const player = snapshot.currentPlayer;
          const storeIdx = player === 0 ? P1_STORE : P2_STORE;
          animBoard[storeIdx] = (animBoard[storeIdx] ?? 0) + total;
          animBoard[capPit] = 0;
          animBoard[oppPit] = 0;
          setDisplayBoard([...animBoard]);
          pushToast(
            `Capture! +${total} stones to P${player === 0 ? 1 : 2}'s store`,
            "capture",
          );
          setFlashPits(new Map([[storeIdx, "last-drop"]]));
          await sleep(500);
        }

        // Sync to final resulting board (handles end-of-game sweep).
        setDisplayBoard([...result.state.board]);
        setFlashPits(new Map());
        setAnimatingPit(null);

        if (result.extraTurn) {
          pushToast(
            `P${snapshot.currentPlayer === 0 ? 1 : 2} gets another turn!`,
            "free-turn",
          );
        }

        if (result.state.gameOver) {
          const w = result.state.winner;
          if (w === "tie") pushToast("Game over — it's a tie!", "win");
          else pushToast(`Game over — Player ${w === 0 ? 1 : 2} wins!`, "win");
        }

        setState(result.state);
      } finally {
        busy.current = false;
      }
    },
    [state, pushToast],
  );

  // AI trigger
  useEffect(() => {
    if (mode !== "human-vs-ai") return;
    if (state.gameOver) return;
    if (aiPlayer === null) return;
    if (state.currentPlayer !== aiPlayer) return;
    if (busy.current) return;

    let cancelled = false;
    setAiThinking(true);
    const depth = DIFFICULTY_DEPTH[difficulty];
    const compute = () => {
      // Yield to UI, then compute.
      setTimeout(() => {
        if (cancelled) return;
        const move = chooseAIMove(state, aiPlayer, depth);
        if (cancelled) return;
        setAiThinking(false);
        if (move >= 0) void runMove(move);
      }, 420);
    };
    compute();
    return () => {
      cancelled = true;
      setAiThinking(false);
    };
  }, [state, mode, aiPlayer, difficulty, runMove]);

  const onPitClick = useCallback(
    (pit: number) => {
      if (aiThinking || animatingPit !== null) return;
      if (mode === "human-vs-ai" && state.currentPlayer === aiPlayer) return;
      if (!validMovesForCurrent.includes(pit)) return;
      void runMove(pit);
    },
    [aiThinking, animatingPit, mode, state.currentPlayer, aiPlayer, validMovesForCurrent, runMove],
  );

  const resetGame = useCallback(() => {
    if (busy.current) return;
    const fresh = initialState();
    setState(fresh);
    setDisplayBoard(fresh.board);
    setAnimatingPit(null);
    setFlashPits(new Map());
    setToasts([]);
  }, []);

  const turnLabel = useMemo(() => {
    if (state.gameOver) {
      if (state.winner === "tie") return "Game Over — Tie";
      return `Game Over — Player ${state.winner === 0 ? 1 : 2} wins`;
    }
    const p = state.currentPlayer === 0 ? 1 : 2;
    if (mode === "human-vs-ai" && state.currentPlayer === aiPlayer) {
      return aiThinking ? `AI (P${p}) is thinking…` : `AI (P${p}) to move`;
    }
    return `Player ${p}'s turn`;
  }, [state, mode, aiPlayer, aiThinking]);

  const p1Score = displayBoard[P1_STORE];
  const p2Score = displayBoard[P2_STORE];

  return (
    <div className="game-shell">
      <header className="game-header">
        <h1 className="game-title">Mancala</h1>
        <div className="game-controls">
          <label className="ctrl">
            <span>Mode</span>
            <select
              value={mode}
              onChange={(e) => {
                const v = e.target.value as Mode;
                setMode(v);
                resetGame();
              }}
            >
              <option value="human-vs-human">Hot-seat</option>
              <option value="human-vs-ai">vs AI</option>
            </select>
          </label>
          {mode === "human-vs-ai" && (
            <>
              <label className="ctrl">
                <span>Difficulty</span>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                >
                  <option value="easy">Easy (3)</option>
                  <option value="medium">Medium (5)</option>
                  <option value="hard">Hard (7)</option>
                </select>
              </label>
              <label className="ctrl">
                <span>You play</span>
                <select
                  value={humanPlaysAs}
                  onChange={(e) => {
                    setHumanPlaysAs(Number(e.target.value) as Player);
                    resetGame();
                  }}
                >
                  <option value={0}>Player 1 (bottom)</option>
                  <option value={1}>Player 2 (top)</option>
                </select>
              </label>
            </>
          )}
          <button className="btn-reset" onClick={resetGame}>
            New game
          </button>
        </div>
      </header>

      <div className="score-bar">
        <div className={`score ${state.currentPlayer === 1 ? "score-active" : ""}`}>
          <span className="score-label">Player 2</span>
          <span className="score-value">{p2Score}</span>
        </div>
        <div className="turn-banner" role="status" aria-live="polite">
          {turnLabel}
        </div>
        <div className={`score ${state.currentPlayer === 0 ? "score-active" : ""}`}>
          <span className="score-label">Player 1</span>
          <span className="score-value">{p1Score}</span>
        </div>
      </div>

      <Board
        state={state}
        displayBoard={displayBoard}
        validMoves={validMovesForCurrent}
        onPitClick={onPitClick}
        humanPlayer={humanLabel}
        currentAnimatingPit={animatingPit}
        flashPits={flashPits}
        aiThinking={aiThinking}
      />

      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.variant}`}>
            {t.message}
          </div>
        ))}
      </div>

      {state.gameOver && (
        <div className="gameover-overlay" role="dialog" aria-modal="true">
          <div className="gameover-card">
            <h2>
              {state.winner === "tie"
                ? "It's a tie!"
                : `Player ${state.winner === 0 ? 1 : 2} wins!`}
            </h2>
            <p className="gameover-score">
              Player 1: <strong>{p1Score}</strong> &middot; Player 2:{" "}
              <strong>{p2Score}</strong>
            </p>
            <button className="btn-primary" onClick={resetGame}>
              Play again
            </button>
          </div>
        </div>
      )}

      <footer className="game-footer">
        <details>
          <summary>How to play</summary>
          <ul>
            <li>Pick a pit on your side; stones sow counter-clockwise.</li>
            <li>Skip the opponent&apos;s store when sowing.</li>
            <li>Last stone in your own store ⇒ free turn.</li>
            <li>
              Last stone in an empty pit on your side (opposite pit non-empty) ⇒
              capture both into your store.
            </li>
            <li>
              Game ends when a side is empty. Remaining stones sweep into each
              player&apos;s store.
            </li>
          </ul>
        </details>
      </footer>
    </div>
  );
}
