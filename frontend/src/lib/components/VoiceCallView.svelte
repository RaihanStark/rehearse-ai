<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import {
    ArrowLeft,
    Briefcase,
    Captions,
    CheckCircle2,
    Clock,
    FileText,
    Mic,
    MicOff,
    PhoneCall,
    PhoneOff,
    Send,
    Volume2,
    X,
    XCircle,
  } from 'lucide-svelte';
  import type { MockApplication, StageOutcome, TranscriptEntry } from '../mockInterviews';
  import type { MockJob } from '../mockJobs';
  import { Button, Input, Modal, Select, Textarea } from './ui';

  interface Props {
    application: MockApplication;
    stageIndex: number;
    job: MockJob | null;
    onUpdateNotes: (notes: string) => void;
    onCancelLobby: () => void;
    onFinishCall: (transcript: TranscriptEntry[], durationSec: number, outcome: StageOutcome) => void;
  }

  let { application, stageIndex, job, onUpdateNotes, onCancelLobby, onFinishCall }: Props = $props();

  let stage = $derived(application.stages[stageIndex]);

  let phase = $state<'lobby' | 'live'>('lobby');
  let selectedMic = $state('Default — Built-in Microphone');
  let elapsedSec = $state(0);
  let muted = $state(false);
  let activeSpeaker = $state<'interviewer' | 'you' | 'none'>('interviewer');
  let sidePanel = $state<'transcript' | 'notes' | 'job' | null>('transcript');
  let showEndConfirm = $state(false);
  let mockOutcome = $state<StageOutcome>('passed');
  let showFinishedModal = $state(false);
  let finalDurationSec = $state(0);
  let draftMessage = $state('');
  let timerId: number | null = null;
  let transcript = $state<TranscriptEntry[]>([]);

  function enterLiveCall() {
    const s = application.stages[stageIndex];
    transcript = [
      {
        time: '00:04',
        speaker: 'interviewer',
        text: `Hi Raihan, thanks for joining. I'm the ${s.interviewerRole} at ${application.company}. Today we'll spend about ${s.minutes} minutes on ${s.name.toLowerCase()}. Ready to get started?`,
      },
    ];
    elapsedSec = 0;
    activeSpeaker = 'interviewer';
    phase = 'live';
    timerId = window.setInterval(() => {
      elapsedSec += 1;
    }, 1000);
    window.setTimeout(() => {
      if (activeSpeaker === 'interviewer') activeSpeaker = 'none';
    }, 2600);
  }

  function confirmEndCall() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
    finalDurationSec = elapsedSec;
    activeSpeaker = 'none';
    showEndConfirm = false;
    showFinishedModal = true;
  }

  onMount(() => {
    // Timer and opening greeting start only after clicking "Join Call Now" in the lobby
  });

  function formatTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function togglePanel(panel: 'transcript' | 'notes' | 'job') {
    sidePanel = sidePanel === panel ? null : panel;
  }

  function handleSendMockTurn(e: Event) {
    e.preventDefault();
    const text = draftMessage.trim();
    if (!text) return;

    activeSpeaker = 'you';
    transcript = [
      ...transcript,
      { time: formatTime(elapsedSec), speaker: 'you', text },
    ];
    draftMessage = '';

    setTimeout(() => {
      activeSpeaker = 'interviewer';
      transcript = [
        ...transcript,
        {
          time: formatTime(elapsedSec),
          speaker: 'interviewer',
          text: 'Got it—that makes sense. Can you walk me through a concrete tradeoff or bottleneck you ran into there, and how you measured the impact?',
        },
      ];
      setTimeout(() => {
        activeSpeaker = 'none';
      }, 2200);
    }, 900);
  }

  onDestroy(() => {
    if (timerId !== null) clearInterval(timerId);
  });
</script>

{#if phase === 'lobby'}
  <!-- Pre-Call Lobby ("Ready to join?") -->
  <div class="flex h-screen flex-col bg-[#fafaf9] text-neutral-900 antialiased">
    <header class="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-6">
      <button
        type="button"
        onclick={onCancelLobby}
        class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        Back to Interviews
      </button>
      <div class="text-xs text-neutral-500">
        {application.company} · Round {stageIndex + 1} of {application.stages.length}
      </div>
    </header>

    <main class="flex flex-1 items-center justify-center p-6">
      <div class="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-12">
        <!-- Left: Audio & Mic Check -->
        <div class="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-6 md:col-span-6">
          <div class="flex flex-1 flex-col items-center justify-center py-6">
            <div class="relative flex items-center justify-center">
              {#if !muted}
                <span class="absolute h-24 w-24 animate-ping rounded-full bg-emerald-500/15 [animation-duration:1.8s]"></span>
                <span class="absolute h-24 w-24 rounded-full ring-2 ring-emerald-500/35"></span>
              {/if}
              <div class="relative flex h-20 w-20 items-center justify-center rounded-full bg-neutral-200 text-xl font-semibold text-neutral-700">
                RH
              </div>
            </div>
            <div class="mt-4 text-sm font-semibold text-neutral-900">Audio Check</div>
            <div class="mt-1 flex items-center gap-1.5 text-xs">
              {#if muted}
                <MicOff class="h-3.5 w-3.5 text-red-600" />
                <span class="text-red-600">Microphone muted</span>
              {:else}
                <Mic class="h-3.5 w-3.5 text-emerald-600" />
                <span class="text-emerald-700">Microphone ready</span>
              {/if}
            </div>
          </div>

          <div class="space-y-3 border-t border-neutral-100 pt-4">
            <Select label="Microphone" bind:value={selectedMic}>
              <option>Default — Built-in Microphone</option>
              <option>Headset Microphone (Bluetooth)</option>
              <option>USB Condenser Mic</option>
            </Select>

            <Button
              variant={muted ? 'danger-subtle' : 'secondary'}
              size="md"
              fullWidth
              onclick={() => (muted = !muted)}
              class={muted ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' : ''}
            >
              {#if muted}
                <MicOff class="h-3.5 w-3.5" />
                Unmute Microphone
              {:else}
                <Mic class="h-3.5 w-3.5" />
                Mute Microphone
              {/if}
            </Button>
          </div>
        </div>

        <!-- Right: Round Brief & Join CTA -->
        <div class="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-6 md:col-span-6">
          <div>
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-semibold {application.accent}"
              >
                {application.initials}
              </div>
              <div>
                <div class="text-xs font-medium text-neutral-500">{application.company}</div>
                <div class="text-xs text-neutral-400">{application.title}</div>
              </div>
            </div>

            <h1 class="mt-5 text-lg font-semibold tracking-tight text-neutral-900">
              Round {stageIndex + 1}: {stage.name}
            </h1>

            <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              <span>{stage.interviewerRole}</span>
              <span>·</span>
              <span class="inline-flex items-center gap-1 font-mono">
                <Clock class="h-3 w-3 text-neutral-400" />
                {stage.minutes}m
              </span>
            </div>

            <p class="mt-4 text-xs leading-relaxed text-neutral-600">
              {stage.focus}
            </p>

            <div class="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-[11px] leading-relaxed text-neutral-600">
              Once you join and submit this round, the outcome (Pass or Reject) is final and cannot be retaken.
            </div>
          </div>

          <div class="mt-6 flex items-center gap-2">
            <Button variant="secondary" size="md" onclick={onCancelLobby}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onclick={enterLiveCall} class="flex-1">
              <PhoneCall class="h-3.5 w-3.5" />
              Join Call Now
            </Button>
          </div>
        </div>
      </div>
    </main>
  </div>
{:else}
<div class="flex h-screen flex-col overflow-hidden bg-[#fafaf9] text-neutral-900 antialiased">
  <!-- Top Call Header -->
  <header class="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-neutral-200 bg-white px-6">
    <div class="flex items-center gap-3">
      <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold {application.accent}"
      >
        {application.initials}
      </div>
      <div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-neutral-900">
            {application.company} · Round {stageIndex + 1}: {stage.name}
          </span>
        </div>
        <div class="text-[11px] text-neutral-500">
          with {stage.interviewerRole} · {application.title}
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1 font-mono text-xs text-neutral-700">
        <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
        <span>{formatTime(elapsedSec)}</span>
        <span class="text-neutral-400">/ {stage.minutes}:00</span>
      </div>

      <div class="hidden items-center gap-1 sm:flex">
        <button
          type="button"
          onclick={() => togglePanel('transcript')}
          class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition {sidePanel === 'transcript'
            ? 'bg-neutral-900 text-white'
            : 'text-neutral-600 hover:bg-neutral-100'}"
        >
          <Captions class="h-3.5 w-3.5" />
          Transcript
        </button>
        <button
          type="button"
          onclick={() => togglePanel('notes')}
          class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition {sidePanel === 'notes'
            ? 'bg-neutral-900 text-white'
            : 'text-neutral-600 hover:bg-neutral-100'}"
        >
          <FileText class="h-3.5 w-3.5" />
          Notes
        </button>
        {#if job}
          <button
            type="button"
            onclick={() => togglePanel('job')}
            class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition {sidePanel === 'job'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:bg-neutral-100'}"
          >
            <Briefcase class="h-3.5 w-3.5" />
            Job Info
          </button>
        {/if}
      </div>
    </div>
  </header>

  <!-- Main Call Workspace -->
  <div class="flex min-h-0 flex-1 overflow-hidden">
    <!-- Center Call Stage -->
    <main class="flex flex-1 flex-col items-center justify-center p-6 lg:p-10">
      <div class="grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
        <!-- Interviewer Tile -->
        <div
          class="relative flex aspect-[4/3] flex-col items-center justify-center rounded-xl border bg-white p-6 transition-all duration-200 {activeSpeaker === 'interviewer'
            ? 'border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
            : 'border-neutral-200'}"
        >
          <!-- Active Speaker Audio Bars (top-right) -->
          {#if activeSpeaker === 'interviewer'}
            <div class="absolute right-4 top-4 flex h-5 items-end gap-0.5 rounded-full bg-emerald-50 px-2 py-1">
              <span class="h-2 w-0.5 animate-bounce rounded-full bg-emerald-600 [animation-delay:-0.3s] [animation-duration:0.65s]"></span>
              <span class="h-3.5 w-0.5 animate-bounce rounded-full bg-emerald-600 [animation-delay:-0.15s] [animation-duration:0.55s]"></span>
              <span class="h-2.5 w-0.5 animate-bounce rounded-full bg-emerald-600 [animation-duration:0.7s]"></span>
            </div>
          {/if}

          <!-- Avatar with subtle speaking pulse ring -->
          <div class="relative flex items-center justify-center">
            {#if activeSpeaker === 'interviewer'}
              <span class="absolute h-24 w-24 animate-ping rounded-full bg-emerald-500/15 [animation-duration:1.6s]"></span>
              <span class="absolute h-24 w-24 rounded-full ring-2 ring-emerald-500/40"></span>
            {/if}
            <div
              class="relative flex h-20 w-20 items-center justify-center rounded-full text-xl font-semibold {application.accent}"
            >
              {application.initials}
            </div>
          </div>

          <div class="mt-4 text-sm font-semibold text-neutral-900">
            {stage.interviewerRole}
          </div>
          <div class="mt-0.5 text-xs text-neutral-500">{application.company}</div>

          <div class="absolute bottom-3.5 left-4 flex items-center gap-1.5 text-[11px] font-medium">
            {#if activeSpeaker === 'interviewer'}
              <Volume2 class="h-3.5 w-3.5 text-emerald-600" />
              <span class="text-emerald-700">Speaking</span>
            {:else}
              <span class="text-neutral-400">Listening</span>
            {/if}
          </div>
        </div>

        <!-- Candidate (You) Tile -->
        <div
          class="relative flex aspect-[4/3] flex-col items-center justify-center rounded-xl border bg-white p-6 transition-all duration-200 {activeSpeaker === 'you' && !muted
            ? 'border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
            : 'border-neutral-200'}"
        >
          <!-- Active Speaker Audio Bars (top-right) -->
          {#if activeSpeaker === 'you' && !muted}
            <div class="absolute right-4 top-4 flex h-5 items-end gap-0.5 rounded-full bg-emerald-50 px-2 py-1">
              <span class="h-2 w-0.5 animate-bounce rounded-full bg-emerald-600 [animation-delay:-0.3s] [animation-duration:0.65s]"></span>
              <span class="h-3.5 w-0.5 animate-bounce rounded-full bg-emerald-600 [animation-delay:-0.15s] [animation-duration:0.55s]"></span>
              <span class="h-2.5 w-0.5 animate-bounce rounded-full bg-emerald-600 [animation-duration:0.7s]"></span>
            </div>
          {/if}

          <!-- Avatar with subtle speaking pulse ring -->
          <div class="relative flex items-center justify-center">
            {#if activeSpeaker === 'you' && !muted}
              <span class="absolute h-24 w-24 animate-ping rounded-full bg-emerald-500/15 [animation-duration:1.6s]"></span>
              <span class="absolute h-24 w-24 rounded-full ring-2 ring-emerald-500/40"></span>
            {/if}
            <div class="relative flex h-20 w-20 items-center justify-center rounded-full bg-neutral-200 text-xl font-semibold text-neutral-700">
              RH
            </div>
          </div>

          <div class="mt-4 text-sm font-semibold text-neutral-900">You</div>
          <div class="mt-0.5 text-xs text-neutral-500">Candidate</div>

          <div class="absolute bottom-3.5 left-4 flex items-center gap-1.5 text-[11px] font-medium">
            {#if muted}
              <MicOff class="h-3.5 w-3.5 text-red-600" />
              <span class="text-red-600">Muted</span>
            {:else if activeSpeaker === 'you'}
              <Mic class="h-3.5 w-3.5 text-emerald-600" />
              <span class="text-emerald-700">Speaking</span>
            {:else}
              <Mic class="h-3.5 w-3.5 text-neutral-400" />
              <span class="text-neutral-500">Mic on</span>
            {/if}
          </div>
        </div>
      </div>

      <!-- Subtle Round Focus Caption -->
      <p class="mt-6 max-w-xl text-center text-xs text-neutral-500">
        {stage.focus}
      </p>

      <!-- UI Mock Preview Switcher -->
      <div class="mt-4 flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1 text-[11px] text-neutral-500">
        <span class="px-2 text-neutral-400">Preview speaker:</span>
        {#each [
          ['interviewer', 'Interviewer'],
          ['you', 'You'],
          ['none', 'Idle'],
        ] as [stateKey, label]}
          <button
            type="button"
            onclick={() => (activeSpeaker = stateKey as 'interviewer' | 'you' | 'none')}
            class="rounded-full px-2.5 py-0.5 font-medium transition {activeSpeaker === stateKey
              ? 'bg-neutral-900 text-white'
              : 'hover:bg-neutral-100 hover:text-neutral-800'}"
          >
            {label}
          </button>
        {/each}
      </div>
    </main>

    <!-- Collapsible Right Side Panel -->
    {#if sidePanel}
      <aside class="flex w-80 shrink-0 flex-col border-l border-neutral-200 bg-white lg:w-96">
        <div class="flex h-11 shrink-0 items-center justify-between border-b border-neutral-200 px-4">
          <span class="text-xs font-semibold text-neutral-900">
            {#if sidePanel === 'transcript'}
              Live Transcript
            {:else if sidePanel === 'notes'}
              Preparation Notes
            {:else}
              Job & Company Info
            {/if}
          </span>
          <button
            type="button"
            onclick={() => (sidePanel = null)}
            class="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>

        {#if sidePanel === 'transcript'}
          <div class="flex-1 space-y-3 overflow-y-auto p-4 text-xs">
            {#each transcript as entry}
              <div class="space-y-1">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="font-semibold {entry.speaker === 'you' ? 'text-neutral-900' : 'text-neutral-500'}">
                    {entry.speaker === 'you' ? 'You' : stage.interviewerRole}
                  </span>
                  <span class="font-mono text-[10px] text-neutral-400">{entry.time}</span>
                </div>
                <p class="leading-relaxed text-neutral-700">{entry.text}</p>
              </div>
            {/each}
          </div>

          <form
            onsubmit={handleSendMockTurn}
            class="flex items-center gap-2 border-t border-neutral-200 p-3"
          >
            <Input
              bind:value={draftMessage}
              type="text"
              placeholder="Type a mock reply to test..."
              class="bg-neutral-50 focus:bg-white"
            />
            <Button type="submit" variant="primary" size="icon" disabled={!draftMessage.trim()}>
              <Send class="h-3.5 w-3.5" />
            </Button>
          </form>
        {:else if sidePanel === 'notes'}
          <div class="flex flex-1 flex-col p-4">
            <Textarea
              value={application.prepNotes}
              oninput={(e) => onUpdateNotes((e.currentTarget as HTMLTextAreaElement).value)}
              placeholder="Jot notes or reference points during the call..."
              class="h-full flex-1 resize-none"
            />
          </div>
        {:else if sidePanel === 'job' && job}
          <div class="flex-1 space-y-4 overflow-y-auto p-4 text-xs leading-relaxed text-neutral-700">
            <div>
              <div class="font-semibold text-neutral-900">{job.title}</div>
              <div class="text-neutral-500">{job.company} · {job.location} · {job.salary}</div>
            </div>
            <div>
              <div class="font-semibold text-neutral-900">About the role</div>
              <p class="mt-1 text-neutral-600">{job.summary}</p>
            </div>
            <div>
              <div class="font-semibold text-neutral-900">Company</div>
              <p class="mt-1 text-neutral-600">{job.companyProfile.tagline}</p>
              <p class="mt-1 text-neutral-600">{job.companyProfile.about[0]}</p>
            </div>
            <div>
              <div class="font-semibold text-neutral-900">Requirements</div>
              <ul class="mt-1 list-disc space-y-1 pl-4 text-neutral-600">
                {#each job.requirements as r}
                  <li>{r}</li>
                {/each}
              </ul>
            </div>
          </div>
        {/if}
      </aside>
    {/if}
  </div>

  <!-- Bottom Call Controls -->
  <footer class="flex h-18 shrink-0 items-center justify-center gap-3 border-t border-neutral-200 bg-white px-6">
    <Button
      variant={muted ? 'danger-subtle' : 'secondary'}
      pill
      onclick={() => (muted = !muted)}
      class="py-2.5 {muted ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' : ''}"
    >
      {#if muted}
        <MicOff class="h-4 w-4" />
        Unmute
      {:else}
        <Mic class="h-4 w-4" />
        Mute
      {/if}
    </Button>

    <Button
      variant={sidePanel === 'transcript' ? 'primary' : 'secondary'}
      pill
      onclick={() => togglePanel('transcript')}
      class="py-2.5"
    >
      <Captions class="h-4 w-4" />
      Captions
    </Button>

    <Button
      variant={sidePanel === 'notes' ? 'primary' : 'secondary'}
      pill
      onclick={() => togglePanel('notes')}
      class="py-2.5"
    >
      <FileText class="h-4 w-4" />
      Notes
    </Button>

    <Button
      variant="danger"
      pill
      onclick={() => (showEndConfirm = true)}
      class="ml-2 px-5 py-2.5"
    >
      <PhoneOff class="h-4 w-4" />
      End Call
    </Button>
  </footer>

  <!-- End Call Confirmation Modal -->
  <Modal
    open={showEndConfirm}
    maxWidth="sm"
    title={`End Round ${stageIndex + 1}?`}
    description="Ending this call submits the round for evaluation. Completed rounds cannot be retaken."
  >
    <div class="rounded-md border border-neutral-200 bg-neutral-50 p-3">
      <div class="text-[11px] font-medium text-neutral-500">Preview outcome (UI mock)</div>
      <div class="mt-2 grid grid-cols-2 gap-1.5 text-xs">
        <button
          type="button"
          onclick={() => (mockOutcome = 'passed')}
          class="rounded border py-1.5 font-medium transition {mockOutcome === 'passed'
            ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
            : 'border-neutral-200 bg-white text-neutral-600'}"
        >
          Pass Round
        </button>
        <button
          type="button"
          onclick={() => (mockOutcome = 'rejected')}
          class="rounded border py-1.5 font-medium transition {mockOutcome === 'rejected'
            ? 'border-red-600 bg-red-50 text-red-700'
            : 'border-neutral-200 bg-white text-neutral-600'}"
        >
          Reject
        </button>
      </div>
    </div>

    <div class="mt-5 flex justify-end gap-2">
      <Button variant="secondary" size="sm" onclick={() => (showEndConfirm = false)}>
        Stay in Call
      </Button>
      <Button variant="danger" size="sm" onclick={confirmEndCall}>
        End & Submit Round
      </Button>
    </div>
  </Modal>

  <!-- Round Completed Outcome Modal -->
  <Modal open={showFinishedModal} maxWidth="sm">
    {@const nextStage = application.stages[stageIndex + 1]}
    <div class="text-center">
      {#if mockOutcome === 'passed'}
        <div class="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 class="h-6 w-6" />
        </div>
        <h2 class="mt-3.5 text-base font-semibold text-neutral-900">
          Round {stageIndex + 1} Passed
        </h2>
      {:else}
        <div class="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
          <XCircle class="h-6 w-6" />
        </div>
        <h2 class="mt-3.5 text-base font-semibold text-neutral-900">
          Did Not Advance
        </h2>
      {/if}

      <p class="mt-1 text-xs text-neutral-500">
        {application.company} · {stage.name}
      </p>

      <div class="mt-4 grid grid-cols-2 gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs">
        <div>
          <div class="text-neutral-400">Duration</div>
          <div class="mt-0.5 font-mono font-semibold text-neutral-900">
            {formatTime(finalDurationSec)}
          </div>
        </div>
        <div>
          <div class="text-neutral-400">Score</div>
          <div class="mt-0.5 font-mono font-semibold {mockOutcome === 'passed' ? 'text-emerald-700' : 'text-red-700'}">
            {mockOutcome === 'passed' ? '84/100' : '56/100'}
          </div>
        </div>
      </div>

      <p class="mt-3.5 text-xs leading-relaxed text-neutral-500">
        {#if mockOutcome === 'rejected'}
          Your application with {application.company} has closed at Round {stageIndex + 1}. Review the transcript and feedback to see what to improve.
        {:else if nextStage}
          Your transcript and feedback are saved. <strong class="font-medium text-neutral-800">Round {stageIndex + 2} ({nextStage.name})</strong> is now unlocked.
        {:else}
          You passed all hiring rounds! Your final offer summary and full feedback are ready.
        {/if}
      </p>

      <Button
        variant="primary"
        size="md"
        fullWidth
        onclick={() => onFinishCall(transcript, finalDurationSec, mockOutcome)}
        class="mt-5"
      >
        Back to Interviews
      </Button>
    </div>
  </Modal>
</div>
{/if}
