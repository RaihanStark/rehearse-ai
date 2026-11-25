<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  interface Props extends HTMLTextareaAttributes {
    label?: string;
    mono?: boolean;
    value?: string;
  }

  let {
    label,
    mono = false,
    value = $bindable(''),
    class: className = '',
    ...rest
  }: Props = $props();
</script>

{#if label}
  <label class="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
    {label}
    <textarea
      bind:value
      class="mt-2.5 w-full rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs font-normal normal-case tracking-normal leading-relaxed text-neutral-800 placeholder-neutral-400 outline-none transition focus:border-neutral-400 focus:bg-white {mono
        ? 'font-mono'
        : ''} {className}"
      {...rest}
    ></textarea>
  </label>
{:else}
  <textarea
    bind:value
    class="w-full rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-800 placeholder-neutral-400 outline-none transition focus:border-neutral-400 focus:bg-white {mono
      ? 'font-mono'
      : ''} {className}"
    {...rest}
  ></textarea>
{/if}
