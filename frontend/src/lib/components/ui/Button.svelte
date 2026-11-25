<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { Loader2 } from 'lucide-svelte';

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-subtle';
    size?: 'xs' | 'sm' | 'md' | 'icon';
    pill?: boolean;
    fullWidth?: boolean;
    loading?: boolean;
    children: Snippet;
  }

  let {
    variant = 'secondary',
    size = 'md',
    pill = false,
    fullWidth = false,
    loading = false,
    disabled = false,
    type = 'button',
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  const variantClasses: Record<NonNullable<Props['variant']>, string> = {
    primary: 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800',
    secondary: 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300',
    ghost: 'bg-transparent text-neutral-600 border-transparent hover:bg-neutral-200/60 hover:text-neutral-900',
    danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700',
    'danger-subtle':
      'bg-white text-neutral-500 border-neutral-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600',
  };

  const sizeClasses: Record<NonNullable<Props['size']>, string> = {
    xs: 'px-2.5 py-1 text-[11px]',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs',
    icon: 'p-1.5 text-xs',
  };
</script>

<button
  {type}
  disabled={disabled || loading}
  class="inline-flex items-center justify-center gap-1.5 border font-medium transition disabled:cursor-not-allowed disabled:opacity-45 {pill
    ? 'rounded-full'
    : 'rounded-md'} {fullWidth ? 'w-full' : ''} {variantClasses[variant]} {sizeClasses[size]} {className}"
  {...rest}
>
  {#if loading}
    <Loader2 class="h-3.5 w-3.5 animate-spin" />
  {/if}
  {@render children()}
</button>
