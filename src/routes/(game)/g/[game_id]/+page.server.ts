import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { GameNotAvailableError, type Game } from "$lib/types";
import type { RecordModel } from "pocketbase";

export const load = (async ({ locals, params }) => {
  const authModel = locals.pocketBase.authStore.model;

  if (!authModel) {
    throw redirect(303, "/");
  }

  try {
    const gamesCollection = locals.pocketBase.collection("games");

    let result: Game & RecordModel = await gamesCollection.getFirstListItem(
      `game_id="${params.game_id}"`
    );

    const playerIsX = result.player_x === authModel["id"];
    const playerIsO = result.player_o && result.player_o === authModel["id"];
    const playerOEmpty = !result.player_o;

    if (!playerIsX && playerOEmpty) {
      result = await gamesCollection.update<Game & RecordModel>(result.id, {
        ...result,
        player_o: authModel["id"],
      });
    }

    if (playerIsX || playerIsO || playerOEmpty) {
      return {
        result,
        playerId: authModel["id"],
      };
    }

    throw new GameNotAvailableError();
  } catch (error) {
    if (error instanceof GameNotAvailableError) {
      throw redirect(303, "/?error=game-not-available");
    }
  }

  throw redirect(303, "/");
}) satisfies PageServerLoad;
