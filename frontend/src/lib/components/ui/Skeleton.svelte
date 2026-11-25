<script lang="ts">
  interface Props {
    class?: string;
  }

  let { class: className = 'h-4 w-full' }: Props = $props();
</script>

<div class="animate-pulse rounded bg-neutral-200/80 {className}"></div>
