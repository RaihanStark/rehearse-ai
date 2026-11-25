<script lang="ts">
  import { Check } from 'lucide-svelte';
  import { Button, Card, Select } from './ui';

  export interface AppSettings {
    voice: string;
    whisperModel: string;
    vadPauseMs: number;
    liveModel: string;
    evalModel: string;
    passThreshold: number;
    stretchRatio: '80_20' | '70_30';
    captionsByDefault: boolean;
  }

  interface Props {
    settings: AppSettings;
    onSave: (next: AppSettings) => void;
  }

  let { settings, onSave }: Props = $props();

  let draft = $state<AppSettings>({
    voice: 'en-US-AndrewMultilingualNeural',
    whisperModel: 'tiny.en',
    vadPauseMs: 900,
    liveModel: 'gemini-4-hydrogen-low',
    evalModel: 'gemini-4-neon-medium',
    passThreshold: 65,
    stretchRatio: '80_20',
    captionsByDefault: true,
  });
  let initialized = $state(false);

  $effect(() => {
    if (!initialized) {
      draft = { ...settings };
      initialized = true;
    }
  });

  let isDirty = $derived(JSON.stringify(draft) !== JSON.stringify(settings));

  function handleSave(e: Event) {
    e.preventDefault();
    onSave({ ...draft });
  }
</script>

<form onsubmit={handleSave} class="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#fafaf9]">
  <!-- Unified Subbar -->
  <div class="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-[#fafaf9] px-6 py-2">
    <div class="text-xs text-neutral-500">
      Local voice, model, and interview pipeline preferences
    </div>

    <Button type="submit" variant="primary" size="sm" disabled={!isDirty}>
      <Check class="h-3.5 w-3.5" />
      Save Settings
    </Button>
  </div>

  <!-- Settings Body -->
  <div class="flex-1 overflow-y-auto px-6 py-6">
    <div class="mx-auto max-w-2xl space-y-5">
      <Card>
        <h2 class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Voice & Audio
        </h2>

        <div class="mt-4 space-y-4">
          <Select label="Interviewer Voice (TTS)" bind:value={draft.voice}>
            <option value="en-US-AndrewMultilingualNeural">Andrew (US Male, Natural)</option>
            <option value="en-US-EmmaMultilingualNeural">Emma (US Female, Natural)</option>
            <option value="en-US-BrianMultilingualNeural">Brian (US Male, Warm)</option>
            <option value="en-US-AvaMultilingualNeural">Ava (US Female, Crisp)</option>
            <option value="en-GB-RyanNeural">Ryan (UK Male)</option>
            <option value="en-GB-SoniaNeural">Sonia (UK Female)</option>
          </Select>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Speech Recognition (Local Whisper)" bind:value={draft.whisperModel}>
              <option value="tiny.en">tiny.en (Fastest · ~0.4s CPU)</option>
              <option value="base.en">base.en (Balanced · ~0.7s CPU)</option>
              <option value="small">small (Multilingual · Slower)</option>
            </Select>

            <Select label="End-of-Speech Pause (VAD)" bind:value={draft.vadPauseMs}>
              <option value={700}>700ms (Snappy)</option>
              <option value={900}>900ms (Balanced)</option>
              <option value={1200}>1200ms (Relaxed)</option>
            </Select>
          </div>

          <label class="flex items-center gap-2.5 text-xs text-neutral-700">
            <input
              type="checkbox"
              bind:checked={draft.captionsByDefault}
              class="h-3.5 w-3.5 rounded border-neutral-300 accent-neutral-900"
            />
            Show live transcript panel by default during voice calls
          </label>
        </div>
      </Card>

      <Card>
        <h2 class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Models (Antigravity CLI)
        </h2>

        <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Live Interview Model" bind:value={draft.liveModel}>
            <option value="gemini-4-hydrogen-low">Gemini 4 Hydrogen (Low — Fastest)</option>
            <option value="gemini-4-hydrogen-medium">Gemini 4 Hydrogen (Medium)</option>
            <option value="gemini-3.8-flash-low">Gemini 3.8 Flash (Low)</option>
            <option value="gemini-4-neon-low">Gemini 4 Neon (Low — Deeper)</option>
          </Select>

          <Select label="Round Evaluator Model" bind:value={draft.evalModel}>
            <option value="gemini-4-neon-medium">Gemini 4 Neon (Medium — Recommended)</option>
            <option value="gemini-4-carbon-medium">Gemini 4 Carbon (Medium — Deepest)</option>
            <option value="gemini-4-hydrogen-medium">Gemini 4 Hydrogen (Medium — Fast)</option>
          </Select>
        </div>
      </Card>

      <Card>
        <h2 class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Pipeline & Job Generation
        </h2>

        <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label class="block text-xs font-medium text-neutral-700">
            <div class="flex items-center justify-between">
              <span>Minimum Score to Pass Round</span>
              <span class="font-mono text-neutral-900">{draft.passThreshold}/100</span>
            </div>
            <input
              type="range"
              min="50"
              max="85"
              step="5"
              bind:value={draft.passThreshold}
              class="mt-2.5 w-full accent-neutral-900"
            />
            <div class="mt-1 flex justify-between text-[10px] text-neutral-400">
              <span>50 (Lenient)</span>
              <span>65 (Standard)</span>
              <span>85 (Strict)</span>
            </div>
          </label>

          <Select label="Generated Job Coverage Mix" bind:value={draft.stretchRatio}>
            <option value="80_20">80% CV Match / 20% Stretch (Realistic)</option>
            <option value="70_30">70% CV Match / 30% Stretch (Harder)</option>
          </Select>
        </div>
      </Card>
    </div>
  </div>
</form>
