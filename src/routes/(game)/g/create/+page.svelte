<script lang="ts">
  import type { ActionData, PageData } from "./$types";

  export let data: PageData;
  export let form: ActionData;
</script>

<h1>Create a new Game</h1>

<form method="POST">
  <input
    type="text"
    name="game-id"
    placeholder="Create a custom id"
    value={form?.gameID ?? data.gameID}
  />
  <button type="submit">Create game</button>
</form>

{#if form?.error}
  <p>{form.error}</p>
{/if}
