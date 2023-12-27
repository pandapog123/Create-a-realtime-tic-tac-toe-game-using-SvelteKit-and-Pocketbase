<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<h1>Tic-tac-toe using SvelteKit and Supabase</h1>

{#if data.authenticated}
  <a href="/g/create">Create a new game</a>
{:else}
  <div class="links">
    <a href="/login">Log in</a>
    <p>or</p>
    <a href="/signup">Sign up</a>
  </div>
{/if}

<style>
  .links {
    display: flex;
    gap: 1rem;
    align-items: center;
    font-size: 1.5rem;
  }
</style>
