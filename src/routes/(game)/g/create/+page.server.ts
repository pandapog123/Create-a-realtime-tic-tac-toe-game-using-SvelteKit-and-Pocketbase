import type { Game } from "$lib/types.js";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { v4 as uuid } from "uuid";

export const load = (async () => {
  return { gameID: uuid() };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ locals, request }) => {
    const authModel = locals.pocketBase.authStore.model;
    if (!authModel) {
      return;
    }

    const formData = await request.formData();

    const gameID = formData.get("game-id");

    try {
      if (typeof gameID !== "string") {
        throw new Error(`Invalid game id`);
      }

      const game: Game = {
        game_id: gameID,
        active: true,
        current_player: "x",
        game: new Array(3).fill(new Array(3).fill("")),
        player_x: authModel["id"],
      };

      const gamesCollection = locals.pocketBase.collection("games");

      await gamesCollection.create(game);
    } catch (error) {
      if (error instanceof Error) {
        return {
          error: error.message,
          gameID,
        };
      }

      return { error: "Unknown error occured when creating game", gameID };
    }

    throw redirect(303, `/g/${gameID}`);
  },
};
