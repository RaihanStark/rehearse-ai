<script lang="ts">
  import {
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    Circle,
    Clock,
    Globe,
    MapPin,
    PhoneCall,
    Trash2,
    Users,
    XCircle,
  } from 'lucide-svelte';
  import type { MockApplication } from '../mockInterviews';
  import type { MockJob } from '../mockJobs';
  import { Badge, Button, Card, Tabs, Textarea } from './ui';

  interface Props {
    applications: MockApplication[];
    jobs: MockJob[];
    selectedId: string;
    detailOpen: boolean;
    onDetailOpenChange: (open: boolean) => void;
    onSelect: (id: string) => void;
    onStartStage: (app: MockApplication, stageIndex: number) => void;
    onWithdraw: (id: string) => void;
    onUpdateNotes: (id: string, notes: string) => void;
    onRespondOffer: (id: string, decision: 'accepted' | 'declined') => void;
  }

  let {
    applications,
    jobs,
    selectedId,
    detailOpen,
    onDetailOpenChange,
    onSelect,
    onStartStage,
    onWithdraw,
    onUpdateNotes,
    onRespondOffer,
  }: Props = $props();

  let statusFilter = $state<'all' | 'active' | 'offer' | 'rejected'>('all');
  let detailTab = $state<'offer' | 'rounds' | 'jd' | 'company'>('rounds');
  let activeRoundIndex = $state<number | null>(null);
  let roundTab = $state<'feedback' | 'transcript' | 'logs'>('feedback');

  $effect(() => {
    // Reset sub-state when switching selected application or closing detail
    if (!detailOpen) {
      activeRoundIndex = null;
    } else {
      const app = applications.find((a) => a.id === selectedId);
      detailTab = app?.status === 'offer' ? 'offer' : 'rounds';
      activeRoundIndex = null;
    }
  });

  function isClosed(app: MockApplication): boolean {
    return app.status === 'offer' || app.status === 'rejected';
  }

  function currentStageIndex(app: MockApplication): number {
    const idx = app.stages.findIndex((s) => s.status === 'current');
    return idx >= 0 ? idx : app.stages.length - 1;
  }

  let filtered = $derived(
    applications.filter((app) => {
      if (statusFilter === 'active') return !isClosed(app);
      if (statusFilter === 'offer') return app.status === 'offer';
      if (statusFilter === 'rejected') return app.status === 'rejected';
      return true;
    })
  );

  let selected = $derived(applications.find((a) => a.id === selectedId) ?? null);
  let selectedJob = $derived(
    selected ? jobs.find((j) => j.id === selected.jobId) ?? null : null
  );

  let activeCount = $derived(applications.filter((a) => !isClosed(a)).length);
  let offerCount = $derived(applications.filter((a) => a.status === 'offer').length);
  let rejectedCount = $derived(applications.filter((a) => a.status === 'rejected').length);
  let avgScore = $derived(() => {
    const scored = applications.filter((a) => a.overallScore !== undefined);
    if (scored.length === 0) return null;
    return Math.round(scored.reduce((acc, a) => acc + (a.overallScore ?? 0), 0) / scored.length);
  });

  function openDetail(id: string) {
    onSelect(id);
    const app = applications.find((a) => a.id === id);
    detailTab = app?.status === 'offer' ? 'offer' : 'rounds';
    activeRoundIndex = null;
    onDetailOpenChange(true);
  }

  function openRoundDetail(index: number) {
    activeRoundIndex = index;
    roundTab = 'feedback';
  }
</script>

{#if detailOpen && selected && activeRoundIndex !== null && selected.stages[activeRoundIndex]}
  {@const rIdx = activeRoundIndex}
  {@const round = selected.stages[rIdx]}
  <div class="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#fafaf9]">
    <!-- Round Detail Subbar -->
    <div class="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-[#fafaf9] px-6 py-2">
      <button
        type="button"
        onclick={() => (activeRoundIndex = null)}
        class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-neutral-600 transition hover:bg-neutral-200/60 hover:text-neutral-900"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        Back to {selected.company}
      </button>

      <div class="text-xs text-neutral-500">
        Round {rIdx + 1} of {selected.stages.length} · {round.interviewerRole}
      </div>
    </div>

    <!-- Round Detail Page -->
    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div class="mx-auto max-w-4xl space-y-5">
        <!-- Round Header -->
        <div class="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-5">
          <div>
            <div class="text-xs font-medium text-neutral-500">
              {selected.company} · {selected.title}
            </div>
            <h2 class="mt-0.5 text-lg font-semibold tracking-tight text-neutral-900">
              Round {rIdx + 1}: {round.name}
            </h2>
            <div class="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              <span>{round.interviewerRole}</span>
              <span>·</span>
              <span class="font-mono">{round.review ? round.review.actualDuration : `${round.minutes}m`}</span>
              {#if round.review}
                <span>·</span>
                <span>Completed {round.review.completedAt}</span>
              {/if}
              {#if round.score !== undefined}
                <span
                  class="rounded px-2 py-0.5 font-semibold {round.outcome === 'rejected'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-emerald-50 text-emerald-700'}"
                >
                  {round.outcome === 'rejected' ? 'Rejected' : 'Passed'} · {round.score}/100
                </span>
              {/if}
            </div>
          </div>

          {#if round.status === 'current'}
            <Button variant="primary" size="md" onclick={() => onStartStage(selected, rIdx)}>
              <PhoneCall class="h-3.5 w-3.5" />
              Join Round
            </Button>
          {:else if round.status === 'upcoming'}
            <Badge variant="outline" size="sm" class="text-neutral-400">Locked</Badge>
          {/if}
        </div>

        {#if round.review}
          {@const rev = round.review}
          <!-- Round Tabs: Feedback | Transcript | Session Logs -->
          <Tabs
            items={[
              { id: 'feedback', label: 'Feedback & Rewrites' },
              { id: 'transcript', label: `Transcript (${rev.transcript.length})` },
              { id: 'logs', label: `Session Logs (${rev.logs.length})` },
            ]}
            active={roundTab}
            onChange={(id) => (roundTab = id as 'feedback' | 'transcript' | 'logs')}
          />

          {#if roundTab === 'feedback'}
            <div class="space-y-5">
              <!-- Rubric Scores -->
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {#each rev.rubric as item}
                  <div class="rounded-lg border border-neutral-200 bg-white p-4">
                    <div class="text-[11px] text-neutral-400">{item.label}</div>
                    <div class="mt-1 text-lg font-semibold text-neutral-900">{item.score}</div>
                    <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                      <div class="h-full rounded-full bg-neutral-900" style="width: {item.score}%"></div>
                    </div>
                  </div>
                {/each}
              </div>

              <!-- Strengths & Improvements -->
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <section class="rounded-lg border border-neutral-200 bg-white p-5 text-xs">
                  <h3 class="font-semibold text-neutral-900">What went well</h3>
                  <ul class="mt-2.5 list-disc space-y-1.5 pl-4 leading-relaxed text-neutral-600">
                    {#each rev.strengths as s}
                      <li>{s}</li>
                    {/each}
                  </ul>
                </section>
                <section class="rounded-lg border border-neutral-200 bg-white p-5 text-xs">
                  <h3 class="font-semibold text-neutral-900">Areas to tighten</h3>
                  <ul class="mt-2.5 list-disc space-y-1.5 pl-4 leading-relaxed text-neutral-600">
                    {#each rev.improvements as imp}
                      <li>{imp}</li>
                    {/each}
                  </ul>
                </section>
              </div>

              <!-- Answer Rewrites -->
              {#if rev.rewrites.length > 0}
                <section class="rounded-lg border border-neutral-200 bg-white p-5">
                  <h3 class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    How to answer stronger
                  </h3>
                  <div class="mt-3 space-y-3">
                    {#each rev.rewrites as rw}
                      <div class="rounded-md border border-neutral-200 bg-neutral-50 p-4 text-xs">
                        <div class="font-semibold text-neutral-900">{rw.question}</div>
                        <div class="mt-2 text-neutral-500">
                          <span class="font-medium text-neutral-700">Gap:</span> {rw.issue}
                        </div>
                        <div class="mt-2 rounded border border-emerald-200 bg-emerald-50/70 p-3 leading-relaxed text-emerald-950">
                          <span class="font-semibold">Stronger answer:</span> {rw.strongerAnswer}
                        </div>
                      </div>
                    {/each}
                  </div>
                </section>
              {/if}
            </div>
          {:else if roundTab === 'transcript'}
            <section class="rounded-lg border border-neutral-200 bg-white">
              <div class="divide-y divide-neutral-100">
                {#each rev.transcript as entry}
                  <div class="flex gap-4 px-5 py-4 text-xs">
                    <div class="w-12 shrink-0 font-mono text-[11px] text-neutral-400">
                      {entry.time}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <span class="font-semibold {entry.speaker === 'you' ? 'text-neutral-900' : 'text-neutral-500'}">
                          {entry.speaker === 'you' ? 'You' : round.interviewerRole}
                        </span>
                        {#if entry.tag}
                          <span class="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                            {entry.tag}
                          </span>
                        {/if}
                      </div>
                      <p class="mt-1 leading-relaxed text-neutral-700">{entry.text}</p>
                    </div>
                  </div>
                {/each}
              </div>
            </section>
          {:else}
            <section class="overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <table class="w-full text-left text-xs">
                <thead class="border-b border-neutral-200 bg-neutral-50 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th class="w-20 px-4 py-2.5">Time</th>
                    <th class="w-40 px-4 py-2.5">Event</th>
                    <th class="px-4 py-2.5">Detail</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100 font-mono text-[11px]">
                  {#each rev.logs as log}
                    <tr>
                      <td class="px-4 py-2.5 text-neutral-400">{log.time}</td>
                      <td class="px-4 py-2.5 font-semibold text-neutral-800">{log.event}</td>
                      <td class="px-4 py-2.5 font-sans text-xs text-neutral-600">{log.detail}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </section>
          {/if}
        {:else}
          <!-- Not Completed Yet -->
          <section class="rounded-lg border border-neutral-200 bg-white p-6">
            <div class="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Round Overview
            </div>
            <p class="mt-2 text-sm text-neutral-700">{round.focus}</p>
            <p class="mt-4 text-xs text-neutral-500">
              Once you complete this round, the full transcript, session logs, rubric scores, and answer rewrites will appear here.
            </p>
          </section>
        {/if}
      </div>
    </div>
  </div>
{:else if detailOpen && selected}
  {@const activeIdx = currentStageIndex(selected)}
  {@const activeStage = selected.stages[activeIdx]}
  <div class="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#fafaf9]">
    <!-- Detail Subbar -->
    <div class="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-[#fafaf9] px-6 py-2">
      <button
        type="button"
        onclick={() => onDetailOpenChange(false)}
        class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-neutral-600 transition hover:bg-neutral-200/60 hover:text-neutral-900"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        Back to Interviews
      </button>

      {#if !isClosed(selected)}
        <div class="flex items-center gap-2">
          <Button
            variant="danger-subtle"
            size="xs"
            onclick={() => {
              onDetailOpenChange(false);
              onWithdraw(selected.id);
            }}
          >
            <Trash2 class="h-3.5 w-3.5" />
            Withdraw
          </Button>
        </div>
      {/if}
    </div>

    <!-- Full Interview Detail Page -->
    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div class="mx-auto max-w-5xl space-y-5">
        <!-- Application Header Card -->
        <div class="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-5">
          <div class="flex items-start gap-3.5">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-semibold {selected.accent}"
            >
              {selected.initials}
            </div>
            <div>
              <div class="text-xs font-medium text-neutral-500">
                {selected.company} · {selected.location} · Applied {selected.appliedAgo}
              </div>
              <h2 class="mt-0.5 text-lg font-semibold tracking-tight text-neutral-900">
                {selected.title}
              </h2>
              <div class="mt-1.5 flex items-center gap-2 text-xs text-neutral-500">
                {#if selected.status === 'offer'}
                  <span class="rounded bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                    {selected.verdict || 'Offer Extended'} · {selected.overallScore}/100
                  </span>
                {:else if selected.status === 'rejected'}
                  <span class="rounded bg-red-50 px-2 py-0.5 font-medium text-red-700">
                    {selected.verdict || 'Rejected'} · {selected.overallScore}/100
                  </span>
                {:else}
                  <span class="rounded bg-neutral-100 px-2 py-0.5 font-medium text-neutral-700">
                    Round {activeIdx + 1} of {selected.stages.length}
                  </span>
                {/if}
                <span>· Last activity {selected.lastActivity}</span>
              </div>
            </div>
          </div>

          {#if !isClosed(selected)}
            <Button variant="primary" size="md" onclick={() => onStartStage(selected, activeIdx)}>
              <PhoneCall class="h-3.5 w-3.5" />
              Join Round {activeIdx + 1}
            </Button>
          {:else if selected.status === 'offer'}
            <Badge variant="success" size="sm" class="font-semibold">
              {selected.verdict || 'Offer Extended'} · {selected.overallScore}/100
            </Badge>
          {:else}
            <Badge variant="danger" size="sm" class="font-semibold">
              {selected.verdict || 'Rejected'}
            </Badge>
          {/if}
        </div>

        <!-- Detail Page Tabs -->
        <div class="flex items-center gap-6 border-b border-neutral-200 text-xs font-medium">
          {#if selected.status === 'offer' && selected.offerDetails}
            <button
              type="button"
              onclick={() => (detailTab = 'offer')}
              class="-mb-px border-b-2 pb-2.5 transition {detailTab === 'offer'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'}"
            >
              Offer Letter
            </button>
          {/if}
          <button
            type="button"
            onclick={() => (detailTab = 'rounds')}
            class="-mb-px border-b-2 pb-2.5 transition {detailTab === 'rounds'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'}"
          >
            Rounds & Prep
          </button>
          {#if selectedJob}
            <button
              type="button"
              onclick={() => (detailTab = 'jd')}
              class="-mb-px border-b-2 pb-2.5 transition {detailTab === 'jd'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'}"
            >
              Job Description
            </button>
            <button
              type="button"
              onclick={() => (detailTab = 'company')}
              class="-mb-px border-b-2 pb-2.5 transition {detailTab === 'company'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'}"
            >
              Company ({selected.company})
            </button>
          {/if}
        </div>

        {#if detailTab === 'offer' && selected.offerDetails}
          {@const offer = selected.offerDetails}
          <!-- Offer Letter Document View -->
          <div class="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
            <!-- Left: Offer Document -->
            <section class="rounded-lg border border-neutral-200 bg-white p-6 lg:col-span-8">
              <div class="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-5">
                <div>
                  <div class="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                    Offer of Employment
                  </div>
                  <h3 class="mt-1 text-lg font-semibold text-neutral-900">
                    {selected.title}
                  </h3>
                  <div class="mt-0.5 text-xs text-neutral-500">
                    {offer.level} · {selected.company} · {selected.location}
                  </div>
                </div>

                {#if offer.decision === 'accepted'}
                  <span class="rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    Offer Accepted
                  </span>
                {:else if offer.decision === 'declined'}
                  <span class="rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-600">
                    Offer Declined
                  </span>
                {/if}
              </div>

              <!-- Compensation Grid -->
              <dl class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div class="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <dt class="text-[11px] text-neutral-400">Base Salary</dt>
                  <dd class="mt-1 text-xs font-semibold text-neutral-900">{offer.baseSalary}</dd>
                </div>
                <div class="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <dt class="text-[11px] text-neutral-400">Equity</dt>
                  <dd class="mt-1 text-xs font-semibold text-neutral-900">{offer.equity}</dd>
                </div>
                <div class="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <dt class="text-[11px] text-neutral-400">Sign-on Bonus</dt>
                  <dd class="mt-1 text-xs font-semibold text-neutral-900">{offer.bonus}</dd>
                </div>
                <div class="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <dt class="text-[11px] text-neutral-400">Start Window</dt>
                  <dd class="mt-1 text-xs font-semibold text-neutral-900">{offer.startWindow}</dd>
                </div>
              </dl>

              <!-- Hiring Manager Note -->
              <div class="mt-6 border-t border-neutral-200 pt-5">
                <div class="text-xs font-semibold text-neutral-900">Note from the team</div>
                <p class="mt-2 text-sm leading-relaxed text-neutral-700">
                  "{offer.hiringManagerNote}"
                </p>
                <div class="mt-3 text-xs text-neutral-500">
                  — <strong class="font-medium text-neutral-800">{offer.hiringManagerName}</strong>, {offer.hiringManagerTitle}
                </div>
              </div>

              <!-- Accept / Decline Actions -->
              {#if !offer.decision}
                <div class="mt-6 flex items-center justify-end gap-2 border-t border-neutral-200 pt-5">
                  <Button variant="secondary" size="md" onclick={() => onRespondOffer(selected.id, 'declined')}>
                    Decline Offer
                  </Button>
                  <Button variant="primary" size="md" onclick={() => onRespondOffer(selected.id, 'accepted')}>
                    Accept Offer
                  </Button>
                </div>
              {/if}
            </section>

            <!-- Right: Hiring Committee Summary -->
            <aside class="space-y-4 lg:col-span-4">
              <section class="rounded-lg border border-neutral-200 bg-white p-5">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Panel Summary
                  </h4>
                  <span class="text-sm font-semibold text-emerald-700">
                    {selected.overallScore}/100
                  </span>
                </div>

                <div class="mt-3 space-y-2">
                  {#each selected.stages as st, i}
                    <button
                      type="button"
                      onclick={() => openRoundDetail(i)}
                      class="flex w-full items-center justify-between rounded-md border border-neutral-100 bg-neutral-50 px-3 py-2 text-left text-xs transition hover:border-neutral-300"
                    >
                      <span class="truncate font-medium text-neutral-800">
                        {i + 1}. {st.name}
                      </span>
                      <span class="ml-2 shrink-0 font-mono font-semibold text-emerald-700">
                        {st.score ?? '—'}
                      </span>
                    </button>
                  {/each}
                </div>
              </section>

              {#if selected.feedbackHighlights}
                <section class="rounded-lg border border-neutral-200 bg-white p-5 text-xs">
                  <h4 class="font-semibold text-neutral-900">Why you got the offer</h4>
                  <ul class="mt-2 list-disc space-y-1.5 pl-4 text-neutral-600">
                    {#each selected.feedbackHighlights.strengths as s}
                      <li>{s}</li>
                    {/each}
                  </ul>

                  <h4 class="mt-4 font-semibold text-neutral-900">Growth areas for onboarding</h4>
                  <ul class="mt-2 list-disc space-y-1.5 pl-4 text-neutral-600">
                    {#each selected.feedbackHighlights.improvements as imp}
                      <li>{imp}</li>
                    {/each}
                  </ul>
                </section>
              {/if}
            </aside>
          </div>
        {:else if detailTab === 'rounds'}
        <!-- 2-Column Detail Body -->
        <div class="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
          <!-- Left: Hiring Rounds & Evaluation -->
          <div class="space-y-5 lg:col-span-7">
            <section class="rounded-lg border border-neutral-200 bg-white p-5">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Hiring Rounds
                </h3>
                <span class="text-xs text-neutral-400">
                  {selected.stages.filter((s) => s.status === 'completed').length}/{selected.stages.length} completed
                </span>
              </div>

              <ol class="mt-3 divide-y divide-neutral-100 rounded-md border border-neutral-200">
                {#each selected.stages as stage, i}
                  <li>
                    <div
                      role="button"
                      tabindex="0"
                      onclick={() => openRoundDetail(i)}
                      onkeydown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openRoundDetail(i);
                        }
                      }}
                      class="group flex cursor-pointer items-start justify-between gap-4 px-4 py-3.5 text-xs transition hover:bg-neutral-50"
                    >
                      <div class="flex items-start gap-2.5">
                        {#if stage.status === 'completed' && stage.outcome === 'rejected'}
                          <XCircle class="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                        {:else if stage.status === 'completed'}
                          <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        {:else if stage.status === 'current'}
                          <span class="mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900">
                            <span class="h-1.5 w-1.5 rounded-full bg-neutral-900"></span>
                          </span>
                        {:else}
                          <Circle class="mt-0.5 h-4 w-4 shrink-0 text-neutral-300" />
                        {/if}

                        <div>
                          <div class="font-semibold text-neutral-900 group-hover:underline">
                            {i + 1}. {stage.name}
                          </div>
                          <div class="mt-0.5 text-[11px] text-neutral-400">
                            {stage.interviewerRole} · {stage.minutes}m
                            {#if stage.review}
                              · {stage.review.transcript.length} turns
                            {/if}
                          </div>
                          <div class="mt-1 text-neutral-600">{stage.focus}</div>
                          {#if stage.note}
                            <div class="mt-2 rounded bg-neutral-50 px-2.5 py-1.5 text-[11px] text-neutral-600 ring-1 ring-neutral-200/70">
                              {stage.note}
                            </div>
                          {/if}
                        </div>
                      </div>

                      <div class="flex shrink-0 items-center gap-2">
                        {#if stage.score !== undefined}
                          <span
                            class="rounded px-2 py-0.5 font-semibold {stage.outcome === 'rejected'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-emerald-50 text-emerald-700'}"
                          >
                            {stage.outcome === 'rejected' ? 'Rejected' : 'Passed'} · {stage.score}
                          </span>
                        {:else if stage.status === 'current'}
                          <button
                            type="button"
                            onclick={(e) => {
                              e.stopPropagation();
                              onStartStage(selected, i);
                            }}
                            class="rounded bg-neutral-900 px-3 py-1 text-[11px] font-medium text-white hover:bg-neutral-800"
                          >
                            Join
                          </button>
                        {/if}
                        <ChevronRight class="h-4 w-4 text-neutral-300 transition group-hover:text-neutral-600" />
                      </div>
                    </div>
                  </li>
                {/each}
              </ol>
            </section>

            {#if selected.status === 'rejected' && selected.rejectionReason}
              <section class="rounded-lg border border-red-200 bg-red-50/50 p-5 text-xs">
                <h3 class="text-xs font-semibold uppercase tracking-wide text-red-700">
                  Rejection Decision
                </h3>
                <p class="mt-2 leading-relaxed text-neutral-700">{selected.rejectionReason}</p>
              </section>
            {/if}

            {#if selected.feedbackHighlights && selected.overallScore !== undefined}
              <section class="rounded-lg border border-neutral-200 bg-white p-5 text-xs">
                <div class="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <h3 class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Final Evaluation
                  </h3>
                  <span class="font-semibold text-emerald-700">
                    {selected.overallScore}/100 · {selected.verdict}
                  </span>
                </div>
                <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div class="font-semibold text-neutral-800">Strengths</div>
                    <ul class="mt-1.5 list-disc space-y-1.5 pl-4 text-neutral-600">
                      {#each selected.feedbackHighlights.strengths as s}
                        <li>{s}</li>
                      {/each}
                    </ul>
                  </div>
                  <div>
                    <div class="font-semibold text-neutral-800">To Improve</div>
                    <ul class="mt-1.5 list-disc space-y-1.5 pl-4 text-neutral-600">
                      {#each selected.feedbackHighlights.improvements as imp}
                        <li>{imp}</li>
                      {/each}
                    </ul>
                  </div>
                </div>
              </section>
            {/if}
          </div>

          <!-- Right: Next Round Info & Prep Notes -->
          <div class="space-y-5 lg:col-span-5">
            {#if !isClosed(selected) && activeStage}
              <section class="rounded-lg border border-neutral-200 bg-white p-5">
                <div class="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Next Round
                </div>
                <div class="mt-1 text-sm font-semibold text-neutral-900">
                  {activeStage.name}
                </div>
                <div class="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                  <span>{activeStage.interviewerRole}</span>
                  <span>·</span>
                  <span class="inline-flex items-center gap-1 font-mono">
                    <Clock class="h-3 w-3 text-neutral-400" />
                    {activeStage.minutes}m
                  </span>
                </div>
                <p class="mt-2.5 text-xs leading-relaxed text-neutral-600">
                  {activeStage.focus}
                </p>
              </section>
            {/if}

            <Card>
              <Textarea
                label="Preparation Notes"
                value={selected.prepNotes}
                oninput={(e) => onUpdateNotes(selected.id, (e.currentTarget as HTMLTextAreaElement).value)}
                rows={8}
                placeholder="Notes from the company page, stories to mention, questions to ask..."
              />
            </Card>
          </div>
        </div>
        {:else if detailTab === 'jd' && selectedJob}
          <!-- Inline Job Description -->
          <div class="rounded-lg border border-neutral-200 bg-white p-6">
            <div class="grid grid-cols-1 gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-2">
              <div>
                <div class="text-xs font-medium text-neutral-500">
                  On your resume ({selectedJob.matchPercent}%)
                </div>
                <div class="mt-2 flex flex-wrap gap-1.5">
                  {#each selectedJob.matchedSkills as skill}
                    <span class="rounded bg-white px-2 py-0.5 text-xs font-medium text-neutral-800 ring-1 ring-neutral-200">
                      {skill}
                    </span>
                  {/each}
                </div>
              </div>
              <div>
                <div class="text-xs font-medium text-neutral-500">
                  Unfamiliar / stretch topics
                </div>
                <div class="mt-2 flex flex-wrap gap-1.5">
                  {#each selectedJob.stretchSkills as gap}
                    <span class="rounded border border-dashed border-neutral-300 bg-white px-2 py-0.5 text-xs text-neutral-600">
                      {gap}
                    </span>
                  {/each}
                </div>
              </div>
            </div>

            <div class="mt-6 space-y-5 text-sm leading-relaxed text-neutral-700">
              <div>
                <h3 class="text-sm font-semibold text-neutral-900">About the role</h3>
                <p class="mt-1.5">{selectedJob.summary}</p>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-neutral-900">Responsibilities</h3>
                <ul class="mt-2 list-disc space-y-1.5 pl-5">
                  {#each selectedJob.responsibilities as item}
                    <li>{item}</li>
                  {/each}
                </ul>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-neutral-900">Requirements</h3>
                <ul class="mt-2 list-disc space-y-1.5 pl-5">
                  {#each selectedJob.requirements as item}
                    <li>{item}</li>
                  {/each}
                </ul>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-neutral-900">Nice to have</h3>
                <ul class="mt-2 list-disc space-y-1.5 pl-5 text-neutral-600">
                  {#each selectedJob.stretchNotes as item}
                    <li>{item}</li>
                  {/each}
                </ul>
              </div>
            </div>
          </div>
        {:else if detailTab === 'company' && selectedJob}
          {@const cp = selectedJob.companyProfile}
          <!-- Inline Company Page -->
          <div class="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 text-sm leading-relaxed text-neutral-700">
            <div>
              <p class="text-sm font-medium text-neutral-900">{cp.tagline}</p>
              <div class="mt-2.5 space-y-2.5 text-neutral-600">
                {#each cp.about as paragraph}
                  <p>{paragraph}</p>
                {/each}
              </div>
            </div>

            <dl class="grid grid-cols-2 gap-x-6 gap-y-4 rounded-md border border-neutral-200 bg-neutral-50 p-4 text-xs sm:grid-cols-3">
              <div>
                <dt class="text-neutral-400">Industry</dt>
                <dd class="mt-0.5 font-medium text-neutral-900">{cp.industry}</dd>
              </div>
              <div>
                <dt class="text-neutral-400">Company size</dt>
                <dd class="mt-0.5 inline-flex items-center gap-1 font-medium text-neutral-900">
                  <Users class="h-3 w-3 text-neutral-400" />
                  {cp.companySize}
                </dd>
              </div>
              <div>
                <dt class="text-neutral-400">Headquarters</dt>
                <dd class="mt-0.5 font-medium text-neutral-900">{cp.hq}</dd>
              </div>
              <div>
                <dt class="text-neutral-400">Founded</dt>
                <dd class="mt-0.5 font-medium text-neutral-900">{cp.founded}</dd>
              </div>
              <div>
                <dt class="text-neutral-400">Stage</dt>
                <dd class="mt-0.5 font-medium text-neutral-900">{cp.stage}</dd>
              </div>
              <div>
                <dt class="text-neutral-400">Website</dt>
                <dd class="mt-0.5 inline-flex items-center gap-1 font-medium text-neutral-900">
                  <Globe class="h-3 w-3 text-neutral-400" />
                  {cp.website}
                </dd>
              </div>
            </dl>

            <div>
              <h3 class="text-sm font-semibold text-neutral-900">Products & Services</h3>
              <div class="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {#each cp.products as prod}
                  <div class="rounded-md border border-neutral-200 p-3.5">
                    <div class="text-xs font-semibold text-neutral-900">{prod.name}</div>
                    <p class="mt-1 text-xs text-neutral-600">{prod.description}</p>
                  </div>
                {/each}
              </div>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-neutral-900">Culture & Benefits</h3>
              <ul class="mt-2 list-disc space-y-1.5 pl-5 text-xs text-neutral-700">
                {#each cp.cultureAndBenefits as item}
                  <li>{item}</li>
                {/each}
              </ul>
            </div>

            <div class="grid grid-cols-1 gap-5 border-t border-neutral-200 pt-5 sm:grid-cols-2">
              <div>
                <h3 class="text-sm font-semibold text-neutral-900">Locations</h3>
                <ul class="mt-2 space-y-1 text-xs text-neutral-600">
                  {#each cp.locations as loc}
                    <li class="flex items-center gap-1.5">
                      <MapPin class="h-3 w-3 text-neutral-400" />
                      {loc}
                    </li>
                  {/each}
                </ul>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-neutral-900">Specialties</h3>
                <div class="mt-2 flex flex-wrap gap-1.5">
                  {#each cp.specialties as tag}
                    <span class="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                      {tag}
                    </span>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <div class="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#fafaf9]">
    <!-- Unified Subbar (h-11, #fafaf9) -->
    <div class="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-[#fafaf9] px-6 py-2">
      <div class="flex items-center gap-1.5">
        {#each [
          ['all', 'All'],
          ['active', 'Ongoing'],
          ['offer', 'Offers'],
          ['rejected', 'Rejected'],
        ] as [key, label]}
          <button
            type="button"
            onclick={() => (statusFilter = key as 'all' | 'active' | 'offer' | 'rejected')}
            class="rounded-md px-2.5 py-1 text-xs font-medium transition {statusFilter === key
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900'}"
          >
            {label}
          </button>
        {/each}
      </div>

      <div class="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
        <span>Active <strong class="ml-1 text-neutral-900">{activeCount}</strong></span>
        <span>Offers <strong class="ml-1 text-emerald-700">{offerCount}</strong></span>
        <span>Rejected <strong class="ml-1 text-red-700">{rejectedCount}</strong></span>
        {#if avgScore() !== null}
          <span>Avg <strong class="ml-1 text-neutral-900">{avgScore()}/100</strong></span>
        {/if}
      </div>
    </div>

    <!-- Main List Canvas -->
    <div class="flex-1 overflow-y-auto px-6 py-5">
      {#if filtered.length === 0}
        <div class="rounded-lg border border-dashed border-neutral-300 bg-white p-12 text-center">
          <p class="text-sm font-medium text-neutral-800">No interviews here yet</p>
          <p class="mt-1 text-xs text-neutral-500">
            Apply to any role from Browse Jobs to start a multi-round interview pipeline.
          </p>
        </div>
      {:else}
        <div class="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table class="w-full text-left text-xs">
            <thead class="border-b border-neutral-200 bg-neutral-50 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              <tr>
                <th class="px-4 py-3">Company & Role</th>
                <th class="px-4 py-3">Current Round</th>
                <th class="px-4 py-3">Progress</th>
                <th class="px-4 py-3">Activity</th>
                <th class="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
              {#each filtered as app}
                {@const idx = currentStageIndex(app)}
                {@const stage = app.stages[idx]}
                <tr
                  onclick={() => openDetail(app.id)}
                  class="cursor-pointer transition hover:bg-neutral-50"
                >
                  <td class="px-4 py-3.5">
                    <div class="flex items-center gap-3">
                      <div
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold {app.accent}"
                      >
                        {app.initials}
                      </div>
                      <div>
                        <div class="font-semibold text-neutral-900">{app.company}</div>
                        <div class="text-neutral-500">{app.title}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3.5">
                    {#if app.status === 'offer'}
                      <span class="rounded bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                        {app.verdict || 'Offer Extended'} · {app.overallScore}/100
                      </span>
                    {:else if app.status === 'rejected'}
                      <span class="rounded bg-red-50 px-2 py-0.5 font-medium text-red-700">
                        {app.verdict || 'Rejected'} · {app.overallScore}/100
                      </span>
                    {:else}
                      <div class="font-medium text-neutral-800">{stage.name}</div>
                      <div class="text-[11px] text-neutral-400">{stage.interviewerRole} · {stage.minutes}m</div>
                    {/if}
                  </td>
                  <td class="px-4 py-3.5">
                    <div class="flex w-24 items-center gap-1">
                      {#each app.stages as st}
                        <div
                          class="h-1.5 flex-1 rounded-full {st.status === 'completed' && st.outcome === 'rejected'
                            ? 'bg-red-500'
                            : st.status === 'completed'
                              ? 'bg-emerald-500'
                              : st.status === 'current'
                                ? 'bg-neutral-900'
                                : 'bg-neutral-200'}"
                        ></div>
                      {/each}
                    </div>
                    <div class="mt-1 text-[11px] text-neutral-400">
                      {app.stages.filter((s) => s.status === 'completed').length}/{app.stages.length} rounds
                    </div>
                  </td>
                  <td class="px-4 py-3.5 text-neutral-500">{app.lastActivity}</td>
                  <td class="px-4 py-3.5 text-right">
                    {#if !isClosed(app)}
                      <Button
                        variant="primary"
                        size="xs"
                        onclick={(e) => {
                          e.stopPropagation();
                          onStartStage(app, idx);
                        }}
                      >
                        Join Round {idx + 1}
                      </Button>
                    {:else}
                      <Button
                        variant="secondary"
                        size="xs"
                        onclick={(e) => {
                          e.stopPropagation();
                          openDetail(app.id);
                        }}
                      >
                        Review
                      </Button>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>
{/if}
