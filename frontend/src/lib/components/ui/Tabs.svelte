<script lang="ts">
  export interface TabItem {
    id: string;
    label: string;
  }

  interface Props {
    items: TabItem[];
    active: string;
    onChange: (id: string) => void;
    class?: string;
  }

  let { items, active, onChange, class: className = '' }: Props = $props();
</script>

<div class="flex items-center gap-5 border-b border-neutral-200 text-xs font-medium {className}">
  {#each items as item}
    <button
      type="button"
      onclick={() => onChange(item.id)}
      class="-mb-px border-b-2 pb-2.5 transition {active === item.id
        ? 'border-neutral-900 text-neutral-900'
        : 'border-transparent text-neutral-500 hover:text-neutral-800'}"
    >
      {item.label}
    </button>
  {/each}
</div>
