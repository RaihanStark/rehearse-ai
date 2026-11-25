<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    padding?: 'none' | 'sm' | 'md' | 'lg';
    class?: string;
    children: Snippet;
  }

  let { padding = 'md', class: className = '', children }: Props = $props();

  const padClasses: Record<NonNullable<Props['padding']>, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };
</script>

<div class="rounded-lg border border-neutral-200 bg-white {padClasses[padding]} {className}">
  {@render children()}
</div>
