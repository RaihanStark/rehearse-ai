<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLSelectAttributes } from 'svelte/elements';

  interface Props extends HTMLSelectAttributes {
    label?: string;
    value?: string | number;
    children: Snippet;
  }

  let {
    label,
    value = $bindable(),
    class: className = '',
    children,
    ...rest
  }: Props = $props();
</script>

{#if label}
  <label class="block text-xs font-medium text-neutral-700">
    {label}
    <select
      bind:value
      class="mt-1.5 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 outline-none transition focus:border-neutral-400 focus:bg-white {className}"
      {...rest}
    >
      {@render children()}
    </select>
  </label>
{:else}
  <select
    bind:value
    class="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 outline-none transition focus:border-neutral-400 focus:bg-white {className}"
    {...rest}
  >
    {@render children()}
  </select>
{/if}
