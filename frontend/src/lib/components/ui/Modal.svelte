<script lang="ts">
  import type { Snippet } from 'svelte';
  import { X } from 'lucide-svelte';

  interface Props {
    open: boolean;
    title?: string;
    description?: string;
    maxWidth?: 'sm' | 'md' | 'lg';
    onClose?: () => void;
    children: Snippet;
  }

  let {
    open,
    title,
    description,
    maxWidth = 'md',
    onClose,
    children,
  }: Props = $props();

  const widthClasses: Record<NonNullable<Props['maxWidth']>, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };
</script>

{#if open}
  <div
    role="dialog"
    aria-modal="true"
    class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
  >
    <div class="w-full {widthClasses[maxWidth]} rounded-lg border border-neutral-200 bg-white p-5 shadow-xl">
      {#if title || onClose}
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            {#if title}
              <h2 class="text-sm font-semibold text-neutral-900">{title}</h2>
            {/if}
            {#if description}
              <p class="mt-0.5 text-xs text-neutral-500">{description}</p>
            {/if}
          </div>
          {#if onClose}
            <button
              type="button"
              onclick={onClose}
              aria-label="Close modal"
              class="rounded p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
            >
              <X class="h-4 w-4" />
            </button>
          {/if}
        </div>
      {/if}
      {@render children()}
    </div>
  </div>
{/if}
