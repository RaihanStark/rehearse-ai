<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'neutral' | 'success' | 'danger' | 'warning' | 'outline' | 'dashed';
    size?: 'xs' | 'sm';
    pill?: boolean;
    class?: string;
    children: Snippet;
  }

  let {
    variant = 'neutral',
    size = 'xs',
    pill = false,
    class: className = '',
    children,
  }: Props = $props();

  const variantClasses: Record<NonNullable<Props['variant']>, string> = {
    neutral: 'bg-neutral-100 text-neutral-700',
    success: 'bg-emerald-50 text-emerald-700',
    danger: 'bg-red-50 text-red-700',
    warning: 'bg-amber-50 text-amber-700',
    outline: 'bg-white text-neutral-800 ring-1 ring-neutral-200',
    dashed: 'border border-dashed border-neutral-300 bg-white text-neutral-600',
  };

  const sizeClasses: Record<NonNullable<Props['size']>, string> = {
    xs: 'px-2 py-0.5 text-[11px]',
    sm: 'px-2.5 py-1 text-xs',
  };
</script>

<span
  class="inline-flex items-center gap-1 font-medium {pill ? 'rounded-full' : 'rounded'} {variantClasses[variant]} {sizeClasses[size]} {className}"
>
  {@render children()}
</span>
