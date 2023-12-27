<script lang="ts">
  import { page } from "$app/stores";
  import { onDestroy, onMount } from "svelte";
  import type { PageData } from "./$types";
  import { pb } from "$lib/pocketbase";
  import type { Game } from "$lib/types";
  import type { RecordModel, UnsubscribeFunc } from "pocketbase";
  import { fade, fly } from "svelte/transition";
  import { v4 as uuid } from "uuid";

  export let data: PageData;

  let game = data.result;

  let toastMessage: string | undefined;
  let toastID: string | undefined;
  let loaded = false;

  $: if (toastMessage) {
    toastID = uuid();
    let localToastID = toastID;
    setTimeout(() => {
      if (toastID === localToastID) {
        toastMessage = undefined;
      }
    }, 3000);
  } else {
    toastID = undefined;
  }

  let unsubscribe: UnsubscribeFunc | undefined;

  onMount(async () => {
    setTimeout(() => {
      loaded = true;
    }, 200);

    if (!$pb) {
      return;
    }

    unsubscribe = await $pb
      .collection("games")
      .subscribe<Game & RecordModel>(data.result.id, (result) => {
        if (result.action === "delete") {
          return;
        }

        if (result.record.id !== data.result.id) {
          return;
        }

        game = result.record;
      });
  });

  onDestroy(async () => {
    if (unsubscribe) {
      await unsubscribe();
    }
  });

  async function handleCellSubmit(rowIndex: number, itemIndex: number) {
    try {
      let localGame = game.game;

      await fetch(`/g/${$page.params.game_id}/${rowIndex}/${itemIndex}`, {
        method: "POST",
      });

      if (game.game === localGame && game.active) {
        toastMessage = "Not your turn";
      }
    } catch (error) {}
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText($page.url.href);

    toastMessage = "Link copied to clipboard";
  }
</script>

{#if game.player_o}
  <div class="game-container">
    <div class="game-grid">
      {#each game.game as row, rowIndex}
        {#each row as item, itemIndex}
          <form
            action="/g/{$page.params.game_id}/{rowIndex}/{itemIndex}"
            method="POST"
            on:submit|preventDefault={() =>
              handleCellSubmit(rowIndex, itemIndex)}
          >
            <button disabled={item !== ""}>
              {item}
            </button>
          </form>
        {/each}
      {/each}
    </div>
  </div>
{:else}
  <h1>Waiting for Player O</h1>

  <button on:click={handleCopyLink}>Copy link for game</button>
{/if}

{#if !game.active && loaded}
  <div class="result-modal-container" transition:fade={{ duration: 100 }}>
    <div class="result-modal" transition:fly={{ y: 100, duration: 300 }}>
      {#if game.winner}
        <h1>Player {game.winner.toUpperCase()} wins!</h1>
      {:else}
        <h1>Draw</h1>
      {/if}

      <a href="/g/create">Create a new game</a>
    </div>
  </div>
{/if}

{#if toastMessage}
  <div class="toast-container">
    <button
      class="toast-message"
      transition:fly={{ y: 100 }}
      on:click={() => (toastMessage = undefined)}
    >
      {toastMessage}
    </button>
  </div>
{/if}

<style>
  .game-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .game-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    width: clamp(100px, 50vw, 90vh);
    height: clamp(100px, 50vw, 90vh);
    border: 1rem solid black;
    border-radius: 1rem;
    grid-gap: 1rem;
    background: black;
  }

  form button {
    width: 100%;
    height: 100%;
    font-size: 2.5rem;
    border: none;
    border-radius: 0.5rem;
    background-color: royalblue;
    color: white;
  }

  form button:active {
    background-color: rgba(65, 105, 225, 0.8);
  }

  form button:disabled {
    background-color: rgba(65, 105, 225, 0.6);
  }

  .toast-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    overflow: hidden;
    display: flex;
    justify-content: center;
    padding: 1rem;
  }

  .result-modal-container {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.6);
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .result-modal {
    padding: 1rem;
    background-color: white;
    border-radius: 1rem;
    box-shadow: black 0 0.5rem 1rem;
  }

  .result-modal a {
    font-size: 1.5rem;
  }

  .toast-message {
    padding: 0.5rem;
    background-color: greenyellow;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    cursor: pointer;
  }
</style>
