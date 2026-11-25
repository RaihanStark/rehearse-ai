<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends HTMLInputAttributes {
    label?: string;
    value?: string | number;
  }

  let {
    label,
    value = $bindable(''),
    class: className = '',
    ...rest
  }: Props = $props();
</script>

{#if label}
  <label class="block text-xs font-medium text-neutral-700">
    {label}
    <input
      bind:value
      class="mt-1.5 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-400 focus:bg-white {className}"
      {...rest}
    />
  </label>
{:else}
  <input
    bind:value
    class="w-full rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-400 {className}"
    {...rest}
  />
{/if}
