export type Player = 0 | 1;

export const P1_STORE = 6;
export const P2_STORE = 13;

export const P1_PITS = [0, 1, 2, 3, 4, 5] as const;
export const P2_PITS = [7, 8, 9, 10, 11, 12] as const;

export interface GameState {
  board: number[];
  currentPlayer: Player;
  gameOver: boolean;
  winner: Player | "tie" | null;
  lastMove: {
    pit: number;
    player: Player;
    captured?: { pit: number; oppositePit: number; total: number };
    extraTurn: boolean;
  } | null;
}

export interface MoveResult {
  state: GameState;
  path: number[];
  captured?: { pit: number; oppositePit: number; total: number };
  extraTurn: boolean;
}

export function initialState(): GameState {
  const board = new Array<number>(14).fill(4);
  board[P1_STORE] = 0;
  board[P2_STORE] = 0;
  return {
    board,
    currentPlayer: 0,
    gameOver: false,
    winner: null,
    lastMove: null,
  };
}

export function isOwnPit(pit: number, player: Player): boolean {
  if (player === 0) return pit >= 0 && pit <= 5;
  return pit >= 7 && pit <= 12;
}

export function isOwnStore(pit: number, player: Player): boolean {
  return player === 0 ? pit === P1_STORE : pit === P2_STORE;
}

export function opponentStore(player: Player): number {
  return player === 0 ? P2_STORE : P1_STORE;
}

export function oppositePit(pit: number): number {
  return 12 - pit;
}

export function validMoves(state: GameState): number[] {
  if (state.gameOver) return [];
  const pits = state.currentPlayer === 0 ? P1_PITS : P2_PITS;
  return pits.filter((p) => state.board[p] > 0);
}

export function isValidMove(state: GameState, pit: number): boolean {
  if (state.gameOver) return false;
  if (!isOwnPit(pit, state.currentPlayer)) return false;
  return state.board[pit] > 0;
}

function sideEmpty(board: number[], player: Player): boolean {
  const pits = player === 0 ? P1_PITS : P2_PITS;
  return pits.every((p) => board[p] === 0);
}

function sweepRemaining(board: number[]): number[] {
  const b = [...board];
  for (const p of P1_PITS) {
    b[P1_STORE] += b[p];
    b[p] = 0;
  }
  for (const p of P2_PITS) {
    b[P2_STORE] += b[p];
    b[p] = 0;
  }
  return b;
}

function computeWinner(board: number[]): Player | "tie" {
  if (board[P1_STORE] > board[P2_STORE]) return 0;
  if (board[P2_STORE] > board[P1_STORE]) return 1;
  return "tie";
}

/**
 * Apply a move; returns a trace path for animation (in order of placement).
 */
export function applyMove(state: GameState, pit: number): MoveResult {
  if (!isValidMove(state, pit)) {
    throw new Error(`Invalid move: pit ${pit} for player ${state.currentPlayer}`);
  }
  const board = [...state.board];
  const player = state.currentPlayer;
  let stones = board[pit];
  board[pit] = 0;
  let idx = pit;
  const path: number[] = [];

  while (stones > 0) {
    idx = (idx + 1) % 14;
    if (idx === opponentStore(player)) continue;
    board[idx] += 1;
    path.push(idx);
    stones -= 1;
  }

  const lastIdx = idx;
  const extraTurn = isOwnStore(lastIdx, player);

  let captured: { pit: number; oppositePit: number; total: number } | undefined;
  if (
    isOwnPit(lastIdx, player) &&
    board[lastIdx] === 1 &&
    board[oppositePit(lastIdx)] > 0
  ) {
    const opp = oppositePit(lastIdx);
    const total = board[lastIdx] + board[opp];
    const storeIdx = player === 0 ? P1_STORE : P2_STORE;
    board[storeIdx] += total;
    board[lastIdx] = 0;
    board[opp] = 0;
    captured = { pit: lastIdx, oppositePit: opp, total };
  }

  let gameOver = sideEmpty(board, 0) || sideEmpty(board, 1);
  let finalBoard = board;
  let winner: Player | "tie" | null = null;
  if (gameOver) {
    finalBoard = sweepRemaining(board);
    winner = computeWinner(finalBoard);
  }

  const nextPlayer: Player = extraTurn ? player : ((1 - player) as Player);

  const newState: GameState = {
    board: finalBoard,
    currentPlayer: gameOver ? player : nextPlayer,
    gameOver,
    winner,
    lastMove: { pit, player, captured, extraTurn: extraTurn && !gameOver },
  };

  return { state: newState, path, captured, extraTurn: extraTurn && !gameOver };
}

// ---------- AI: minimax with alpha-beta pruning ----------

function evaluate(state: GameState, aiPlayer: Player): number {
  const { board } = state;
  const aiStore = aiPlayer === 0 ? P1_STORE : P2_STORE;
  const oppStore = aiPlayer === 0 ? P2_STORE : P1_STORE;
  const aiPits = aiPlayer === 0 ? P1_PITS : P2_PITS;
  const oppPits = aiPlayer === 0 ? P2_PITS : P1_PITS;

  if (state.gameOver) {
    if (state.winner === aiPlayer) return 10000;
    if (state.winner === "tie") return 0;
    return -10000;
  }

  const storeDiff = board[aiStore] - board[oppStore];
  const aiSide = aiPits.reduce<number>((s, p) => s + board[p], 0);
  const oppSide = oppPits.reduce<number>((s, p) => s + board[p], 0);

  return storeDiff * 3 + (aiSide - oppSide) * 0.5;
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  aiPlayer: Player,
): number {
  if (depth === 0 || state.gameOver) {
    return evaluate(state, aiPlayer);
  }
  const moves = validMoves(state);
  if (moves.length === 0) {
    return evaluate(state, aiPlayer);
  }

  const maximizing = state.currentPlayer === aiPlayer;
  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      const { state: next } = applyMove(state, m);
      const val = minimax(next, depth - 1, alpha, beta, aiPlayer);
      if (val > best) best = val;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      const { state: next } = applyMove(state, m);
      const val = minimax(next, depth - 1, alpha, beta, aiPlayer);
      if (val < best) best = val;
      if (best < beta) beta = best;
      if (beta <= alpha) break;
    }
    return best;
  }
}

export function chooseAIMove(
  state: GameState,
  aiPlayer: Player,
  depth: number,
): number {
  const moves = validMoves(state);
  if (moves.length === 0) return -1;

  let bestMove = moves[0];
  let bestVal = -Infinity;
  for (const m of moves) {
    const { state: next } = applyMove(state, m);
    // If AI gets an extra turn (still its turn), continue maximizing.
    const val = minimax(next, depth - 1, -Infinity, Infinity, aiPlayer);
    if (val > bestVal) {
      bestVal = val;
      bestMove = m;
    }
  }
  return bestMove;
}

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTY_DEPTH: Record<Difficulty, number> = {
  easy: 3,
  medium: 5,
  hard: 7,
};
