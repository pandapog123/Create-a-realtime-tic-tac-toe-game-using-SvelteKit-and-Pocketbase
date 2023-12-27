export type Game = {
  game_id: string;
  current_player: "x" | "o";
  player_x: string;
  player_o?: string;
  game: Board;
  active: boolean;
  winner?: "x" | "o";
};

export type Board = ("x" | "o" | "")[][];

export class GameNotAvailableError extends Error {}
