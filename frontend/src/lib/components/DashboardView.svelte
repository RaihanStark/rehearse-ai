<script lang="ts">
  import { ArrowRight, CheckCircle2, PhoneCall, XCircle } from 'lucide-svelte';
  import type { MockApplication } from '../mockInterviews';
  import type { MockJob } from '../mockJobs';

  interface Props {
    applications: MockApplication[];
    jobs: MockJob[];
    onStartStage: (app: MockApplication, stageIndex: number) => void;
    onOpenApplication: (appId: string) => void;
    onOpenJob: (jobId: string) => void;
    onGoToJobs: () => void;
    onGoToInterviews: () => void;
  }

  let {
    applications,
    jobs,
    onStartStage,
    onOpenApplication,
    onOpenJob,
    onGoToJobs,
    onGoToInterviews,
  }: Props = $props();

  let activeApps = $derived(
    applications.filter((a) => a.status === 'ongoing' || a.status === 'ready')
  );
  let offerCount = $derived(applications.filter((a) => a.status === 'offer').length);
  let rejectedCount = $derived(applications.filter((a) => a.status === 'rejected').length);

  let completedRoundsCount = $derived(
    applications.reduce(
      (sum, app) => sum + app.stages.filter((s) => s.status === 'completed').length,
      0
    )
  );

  let avgScore = $derived(() => {
    const scores: number[] = [];
    for (const app of applications) {
      for (const st of app.stages) {
        if (st.score !== undefined) scores.push(st.score);
      }
    }
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  });

  let recentRounds = $derived(
    applications
      .flatMap((app) =>
        app.stages
          .map((st, idx) => ({ app, st, idx }))
          .filter(({ st }) => st.status === 'completed')
      )
      .slice(0, 5)
  );

  let recommendedJobs = $derived(
    jobs
      .filter((j) => !applications.some((a) => a.jobId === j.id))
      .slice(0, 3)
  );

  let focusPoints = $derived(() => {
    const pts: string[] = [];
    for (const app of applications) {
      for (const st of app.stages) {
        if (st.review?.improvements) {
          for (const imp of st.review.improvements) {
            if (pts.length < 4 && !pts.includes(imp)) pts.push(imp);
          }
        }
      }
    }
    return pts;
  });

  function currentStageIndex(app: MockApplication): number {
    const idx = app.stages.findIndex((s) => s.status === 'current');
    return idx >= 0 ? idx : 0;
  }
</script>

<div class="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#fafaf9]">
  <!-- Unified Subbar (h-11, #fafaf9) -->
  <div class="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-[#fafaf9] px-6 py-2">
    <div class="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
      <span>{activeApps.length} ongoing</span>
      <span>·</span>
      <span>{offerCount} {offerCount === 1 ? 'offer' : 'offers'}</span>
      <span>·</span>
      <span>{rejectedCount} rejected</span>
    </div>
    <div class="text-xs text-neutral-400">
      {jobs.length} open roles on board
    </div>
  </div>

  <!-- Dashboard Content -->
  <div class="flex-1 overflow-y-auto px-6 py-6">
    <div class="mx-auto max-w-5xl space-y-5">
      <!-- Top 4 Metrics -->
      <div class="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <div class="rounded-lg border border-neutral-200 bg-white p-4">
          <div class="text-xs text-neutral-500">Ongoing Interviews</div>
          <div class="mt-1.5 text-2xl font-semibold tracking-tight text-neutral-900">
            {activeApps.length}
          </div>
        </div>
        <div class="rounded-lg border border-neutral-200 bg-white p-4">
          <div class="text-xs text-neutral-500">Rounds Completed</div>
          <div class="mt-1.5 text-2xl font-semibold tracking-tight text-neutral-900">
            {completedRoundsCount}
          </div>
        </div>
        <div class="rounded-lg border border-neutral-200 bg-white p-4">
          <div class="text-xs text-neutral-500">Offers Extended</div>
          <div class="mt-1.5 text-2xl font-semibold tracking-tight text-emerald-700">
            {offerCount}
          </div>
        </div>
        <div class="rounded-lg border border-neutral-200 bg-white p-4">
          <div class="text-xs text-neutral-500">Average Round Score</div>
          <div class="mt-1.5 text-2xl font-semibold tracking-tight text-neutral-900">
            {avgScore() !== null ? `${avgScore()}/100` : '—'}
          </div>
        </div>
      </div>

      <!-- Main 2-Column Grid -->
      <div class="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        <!-- Left Column: Active Interviews & Recent Rounds -->
        <div class="space-y-5 lg:col-span-7">
          <!-- Active Interviews -->
          <section class="rounded-lg border border-neutral-200 bg-white">
            <div class="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
              <h2 class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Active Interviews
              </h2>
              <button
                type="button"
                onclick={onGoToInterviews}
                class="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900"
              >
                View all
                <ArrowRight class="h-3 w-3" />
              </button>
            </div>

            {#if activeApps.length === 0}
              <div class="p-6 text-center text-xs text-neutral-500">
                No ongoing interviews right now. Apply to a role from Browse Jobs to begin.
              </div>
            {:else}
              <div class="divide-y divide-neutral-100">
                {#each activeApps as app}
                  {@const idx = currentStageIndex(app)}
                  {@const stage = app.stages[idx]}
                  <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div class="flex min-w-0 items-start gap-3">
                      <div
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold {app.accent}"
                      >
                        {app.initials}
                      </div>
                      <div class="min-w-0">
                        <button
                          type="button"
                          onclick={() => onOpenApplication(app.id)}
                          class="text-left text-sm font-semibold text-neutral-900 hover:underline"
                        >
                          {app.company} — {stage.name}
                        </button>
                        <div class="truncate text-xs text-neutral-500">
                          {app.title} · {stage.interviewerRole} · {stage.minutes}m
                        </div>
                        <div class="mt-2 flex w-32 items-center gap-1">
                          {#each app.stages as st}
                            <div
                              class="h-1 flex-1 rounded-full {st.status === 'completed'
                                ? 'bg-emerald-500'
                                : st.status === 'current'
                                  ? 'bg-neutral-900'
                                  : 'bg-neutral-200'}"
                            ></div>
                          {/each}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onclick={() => onStartStage(app, idx)}
                      class="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800"
                    >
                      <PhoneCall class="h-3.5 w-3.5" />
                      Join Round {idx + 1}
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </section>

          <!-- Recent Completed Rounds -->
          <section class="rounded-lg border border-neutral-200 bg-white">
            <div class="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
              <h2 class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Recent Rounds
              </h2>
            </div>

            {#if recentRounds.length === 0}
              <div class="p-6 text-center text-xs text-neutral-500">
                Completed rounds and scores will appear here.
              </div>
            {:else}
              <div class="divide-y divide-neutral-100">
                {#each recentRounds as { app, st, idx }}
                  <button
                    type="button"
                    onclick={() => onOpenApplication(app.id)}
                    class="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-xs transition hover:bg-neutral-50"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      {#if st.outcome === 'rejected'}
                        <XCircle class="h-4 w-4 shrink-0 text-red-600" />
                      {:else}
                        <CheckCircle2 class="h-4 w-4 shrink-0 text-emerald-600" />
                      {/if}
                      <div class="min-w-0">
                        <div class="truncate font-medium text-neutral-900">
                          {app.company} · Round {idx + 1}: {st.name}
                        </div>
                        <div class="truncate text-[11px] text-neutral-400">
                          {st.interviewerRole} · {st.review?.completedAt ?? app.lastActivity}
                        </div>
                      </div>
                    </div>

                    {#if st.score !== undefined}
                      <span
                        class="shrink-0 rounded px-2 py-0.5 font-mono font-semibold {st.outcome === 'rejected'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-emerald-50 text-emerald-700'}"
                      >
                        {st.score}/100
                      </span>
                    {/if}
                  </button>
                {/each}
              </div>
            {/if}
          </section>
        </div>

        <!-- Right Column: Recommended Roles & Practice Focus -->
        <div class="space-y-5 lg:col-span-5">
          <!-- Recommended Roles -->
          <section class="rounded-lg border border-neutral-200 bg-white">
            <div class="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
              <h2 class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Open Roles to Apply
              </h2>
              <button
                type="button"
                onclick={onGoToJobs}
                class="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900"
              >
                Browse all
                <ArrowRight class="h-3 w-3" />
              </button>
            </div>

            {#if recommendedJobs.length === 0}
              <div class="p-5 text-xs text-neutral-500">
                You've applied to every open role on the board. Generate more in Browse Jobs!
              </div>
            {:else}
              <div class="divide-y divide-neutral-100">
                {#each recommendedJobs as job}
                  <button
                    type="button"
                    onclick={() => onOpenJob(job.id)}
                    class="flex w-full items-start justify-between gap-3 px-5 py-3.5 text-left transition hover:bg-neutral-50"
                  >
                    <div class="flex items-start gap-2.5 min-w-0">
                      <div
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold {job.accent}"
                      >
                        {job.initials}
                      </div>
                      <div class="min-w-0">
                        <div class="truncate text-xs font-semibold text-neutral-900">
                          {job.title}
                        </div>
                        <div class="mt-0.5 text-[11px] text-neutral-500">
                          {job.company} · {job.salary}
                        </div>
                      </div>
                    </div>
                    <span class="shrink-0 text-[11px] font-medium text-emerald-700">
                      {job.matchPercent}%
                    </span>
                  </button>
                {/each}
              </div>
            {/if}
          </section>

          <!-- Practice Focus / Recurring Feedback -->
          <section class="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Areas to Sharpen
            </h2>
            {#if focusPoints().length === 0}
              <p class="mt-2.5 text-xs text-neutral-500">
                Complete a round to see recurring coaching takeaways here.
              </p>
            {:else}
              <ul class="mt-3 list-disc space-y-2 pl-4 text-xs leading-relaxed text-neutral-600">
                {#each focusPoints() as point}
                  <li>{point}</li>
                {/each}
              </ul>
            {/if}
          </section>
        </div>
      </div>
    </div>
  </div>
</div>
