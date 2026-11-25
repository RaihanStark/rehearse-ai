<script lang="ts">
  import { onMount } from 'svelte';

  let backendStatus = $state<'checking...' | 'connected' | 'offline' | 'error'>('checking...');

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

<main class="min-h-screen bg-slate-950 text-slate-100 antialiased">
  <div class="mx-auto max-w-3xl px-6 py-16">
    <h1 class="text-3xl font-bold tracking-tight">rehearse-ai</h1>
    <p class="mt-3 text-sm text-slate-400">
      Backend status:
      <span
        class="ml-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {backendStatus === 'connected'
          ? 'bg-emerald-500/15 text-emerald-300'
          : 'bg-amber-500/15 text-amber-300'}"
      >
        {backendStatus}
      </span>
    </p>
  </div>
</main>
