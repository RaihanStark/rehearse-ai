<script lang="ts">
  import { onMount } from 'svelte';

  let backendStatus = $state('checking...');

  onMount(async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      backendStatus = data.status === 'ok' ? 'connected' : 'error';
    } catch {
      backendStatus = 'offline';
    }
  });
</script>

<main class="container">
  <h1>rehearse-ai</h1>
  <p>Backend status: <strong>{backendStatus}</strong></p>
</main>

<style>
  .container {
    max-width: 720px;
    margin: 4rem auto;
    padding: 0 1.5rem;
  }
</style>
