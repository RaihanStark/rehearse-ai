<script lang="ts">
  import {
    Briefcase,
    Building2,
    Clock,
    FileText,
    Globe,
    LayoutDashboard,
    MapPin,
    PhoneCall,
    Plus,
    Search,
    Settings,
    Users,
    X,
  } from 'lucide-svelte';
  import DashboardView from './lib/components/DashboardView.svelte';
  import InterviewsView from './lib/components/InterviewsView.svelte';
  import ResumeView from './lib/components/ResumeView.svelte';
  import SettingsView, { type AppSettings } from './lib/components/SettingsView.svelte';
  import VoiceCallView from './lib/components/VoiceCallView.svelte';
  import { Badge, Button, Input, Modal, Select, Tabs } from './lib/components/ui';
  import {
    INITIAL_APPLICATIONS,
    type MockApplication,
    type StageOutcome,
    type TranscriptEntry,
  } from './lib/mockInterviews';
  import { MOCK_JOBS, type MockJob } from './lib/mockJobs';

  const CATEGORIES = ['All', 'Backend', 'Fullstack', 'Platform', 'AI Systems'] as const;

  let jobs = $state<MockJob[]>([...MOCK_JOBS]);
  let applications = $state<MockApplication[]>([...INITIAL_APPLICATIONS]);
  let selectedAppId = $state<string>(INITIAL_APPLICATIONS[0].id);
  let interviewDetailOpen = $state(false);
  let activeCall = $state<{ appId: string; stageIndex: number } | null>(null);
  let activeNav = $state<'dashboard' | 'jobs' | 'interviews' | 'resume' | 'settings'>('dashboard');
  let appSettings = $state<AppSettings>({
    voice: 'en-US-AndrewMultilingualNeural',
    whisperModel: 'tiny.en',
    vadPauseMs: 900,
    liveModel: 'gemini-4-hydrogen-low',
    evalModel: 'gemini-4-neon-medium',
    passThreshold: 65,
    stretchRatio: '80_20',
    captionsByDefault: true,
  });
  let searchQuery = $state('');
  let selectedCategory = $state<(typeof CATEGORIES)[number]>('All');
  let selectedJobId = $state<string>(MOCK_JOBS[0].id);
  let detailTab = $state<'job' | 'company'>('job');
  let showNewJobModal = $state(false);
  let genCount = $state(5);
  let genCategory = $state<'Mixed' | MockJob['category']>('Mixed');
  let genReplaceFeed = $state(false);
  let mockCvText = $state(
    'Raihan — Backend & Fullstack Software Engineer (4+ yrs)\n\nSummary\nBackend and fullstack engineer focused on high-throughput APIs, relational databases, and real-time web applications.\n\nCore Stack\nGo, Python, FastAPI, TypeScript, Svelte, Tailwind CSS, PostgreSQL, SQLite, Redis, Docker, Linux, WebSockets.\n\nExperience\n- Built payment and ledger microservices handling 2k+ RPS with Go and PostgreSQL.\n- Reduced p99 API latency by 40% via composite indexing and Redis read-through caching.\n- Shipped interactive real-time web interfaces using Svelte, TypeScript, and Tailwind CSS.'
  );
  let resumeLastSaved = $state('Today');
  let toast = $state<string | null>(null);

  let filteredJobs = $derived(
    jobs.filter((job) => {
      if (selectedCategory !== 'All' && job.category !== selectedCategory) return false;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.matchedSkills.some((s) => s.toLowerCase().includes(q)) ||
        job.stretchSkills.some((s) => s.toLowerCase().includes(q))
      );
    })
  );

  let selectedJob = $derived<MockJob>(
    filteredJobs.find((j) => j.id === selectedJobId) ?? filteredJobs[0] ?? jobs[0]
  );

  let ongoingInterviewsCount = $derived(
    applications.filter((a) => a.status === 'ongoing' || a.status === 'ready').length
  );

  function handleApplyToJob(job: MockJob) {
    const existing = applications.find((a) => a.jobId === job.id);
    if (existing) {
      selectedAppId = existing.id;
      interviewDetailOpen = true;
      activeNav = 'interviews';
      notify(`Opened your application for ${job.company}.`);
      return;
    }

    const created: MockApplication = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      company: job.company,
      initials: job.initials,
      accent: job.accent,
      title: job.title,
      location: job.location,
      status: 'ready',
      appliedAgo: 'Just now',
      lastActivity: 'Just applied',
      prepNotes: '',
      stages: job.stages.map((st, idx) => ({
        name: st.name,
        interviewerRole: st.interviewerRole,
        minutes: st.minutes,
        focus: st.focus,
        status: idx === 0 ? 'current' : 'upcoming',
      })),
    };

    applications = [created, ...applications];
    selectedAppId = created.id;
    interviewDetailOpen = true;
    activeNav = 'interviews';
    notify(`Applied to ${job.company} — ready for Round 1.`);
  }

  function handleWithdrawApplication(id: string) {
    applications = applications.filter((a) => a.id !== id);
    if (selectedAppId === id) {
      selectedAppId = applications[0]?.id ?? '';
    }
    notify('Application withdrawn.');
  }

  function handleUpdateAppNotes(id: string, notes: string) {
    applications = applications.map((a) => (a.id === id ? { ...a, prepNotes: notes } : a));
  }

  function handleRespondOffer(id: string, decision: 'accepted' | 'declined') {
    applications = applications.map((a) => {
      if (a.id !== id || !a.offerDetails) return a;
      return {
        ...a,
        verdict: decision === 'accepted' ? 'Offer Accepted' : 'Offer Declined',
        offerDetails: { ...a.offerDetails, decision },
      };
    });
    notify(decision === 'accepted' ? 'Offer accepted!' : 'Offer declined.');
  }

  function handleFinishCall(
    transcript: TranscriptEntry[],
    durationSec: number,
    outcome: StageOutcome
  ) {
    if (!activeCall) return;
    const { appId, stageIndex } = activeCall;
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;
    const durationLabel = `${mins}m ${String(secs).padStart(2, '0')}s`;
    const roundScore = outcome === 'passed' ? 84 : 56;

    applications = applications.map((app) => {
      if (app.id !== appId) return app;
      const updatedStages = app.stages.map((st, idx) => {
        if (idx === stageIndex) {
          return {
            ...st,
            status: 'completed' as const,
            outcome,
            score: roundScore,
            note:
              outcome === 'passed'
                ? 'Passed this round. Review full transcript and logs inside.'
                : 'Did not meet the bar for this round. Review transcript and gaps inside.',
            review: {
              completedAt: 'Just now',
              actualDuration: durationLabel,
              rubric: [
                { label: 'Clarity', score: outcome === 'passed' ? 85 : 62 },
                { label: 'Technical Depth', score: outcome === 'passed' ? 83 : 52 },
                { label: 'Relevance', score: outcome === 'passed' ? 86 : 58 },
                { label: 'Stretch Handling', score: outcome === 'passed' ? 82 : 50 },
              ],
              strengths:
                outcome === 'passed'
                  ? ['Clear, structured responses aligned with your resume.']
                  : ['Communicated clearly on familiar topics.'],
              improvements:
                outcome === 'passed'
                  ? ['Add concrete metrics earlier when explaining system tradeoffs.']
                  : [
                      'Go deeper on edge cases and failure modes rather than staying high-level.',
                      'Reason from first principles when asked about unfamiliar stretch stack.',
                    ],
              rewrites: [],
              transcript,
              logs: [
                { time: '00:00', event: 'call.started', detail: `Connected · ${st.interviewerRole}` },
                {
                  time: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
                  event: outcome === 'passed' ? 'round.passed' : 'round.rejected',
                  detail: `Score ${roundScore}/100 · ${transcript.length} turns recorded`,
                },
              ],
            },
          };
        }
        if (outcome === 'passed' && idx === stageIndex + 1 && st.status === 'upcoming') {
          return { ...st, status: 'current' as const };
        }
        return st;
      });

      if (outcome === 'rejected') {
        return {
          ...app,
          status: 'rejected' as const,
          lastActivity: 'Just now',
          overallScore: roundScore,
          verdict: `Rejected at Round ${stageIndex + 1}`,
          rejectionReason:
            'Needed deeper technical specificity and stronger tradeoff reasoning during follow-up probes.',
          stages: updatedStages,
        };
      }

      const allDone = updatedStages.every((s) => s.status === 'completed');
      const avg = Math.round(
        updatedStages.reduce((acc, s) => acc + (s.score ?? roundScore), 0) / updatedStages.length
      );
      return {
        ...app,
        status: allDone ? ('offer' as const) : ('ongoing' as const),
        lastActivity: 'Just now',
        overallScore: allDone ? avg : app.overallScore,
        verdict: allDone ? 'Offer Extended' : app.verdict,
        offerDetails: allDone
          ? {
              level: app.title,
              baseSalary: jobs.find((j) => j.id === app.jobId)?.salary || '$120,000 / yr',
              equity: '0.25% (4-yr vest, 1-yr cliff)',
              bonus: '$8,000 sign-on',
              startWindow: 'Flexible (30 days notice)',
              hiringManagerName: 'Hiring Committee',
              hiringManagerTitle: app.company,
              hiringManagerNote:
                'Great work across all four rounds. Your technical depth, clear communication, and pragmatic tradeoff reasoning impressed the panel.',
            }
          : app.offerDetails,
        stages: updatedStages,
      };
    });

    selectedAppId = appId;
    interviewDetailOpen = true;
    activeCall = null;
    activeNav = 'interviews';
    notify(
      outcome === 'passed'
        ? `Round ${stageIndex + 1} passed and saved.`
        : `Application closed at Round ${stageIndex + 1}.`
    );
  }

  const GENERATED_POOL = [
    { company: 'Helios Labs', initials: 'HL', accent: 'bg-neutral-900 text-white', stage: 'Series B · Fintech · 110 people', title: 'Senior Backend Engineer — Billing', location: 'Remote (APAC)', salary: '$115k – $145k', stretch: ['Apache Kafka', 'Temporal'] },
    { company: 'Arbor Data', initials: 'AD', accent: 'bg-emerald-900 text-white', stage: 'Series A · Data Infra · 48 people', title: 'Platform Engineer — Data Pipelines', location: 'Singapore · Remote', salary: '$120k – $150k', stretch: ['ClickHouse', 'Kubernetes'] },
    { company: 'Lumen Voice', initials: 'LV', accent: 'bg-blue-900 text-white', stage: 'Seed · Realtime Audio · 24 people', title: 'Fullstack Engineer — Realtime Studio', location: 'Remote (Global)', salary: '$110k – $140k', stretch: ['WebRTC', 'ONNX Runtime'] },
    { company: 'Bramble Pay', initials: 'BP', accent: 'bg-stone-800 text-white', stage: 'Series B · Payments · 160 people', title: 'Backend Engineer — Risk & Fraud', location: 'Jakarta · Hybrid', salary: '$80k – $110k', stretch: ['Flink', 'gRPC Streaming'] },
    { company: 'QuarryDB', initials: 'QD', accent: 'bg-red-900 text-white', stage: 'Series B · Database · 85 people', title: 'Systems Engineer — Storage Engine', location: 'Remote (EU / APAC)', salary: '$135k – $170k', stretch: ['Raft Consensus', 'Rust'] },
    { company: 'SignalCraft', initials: 'SC', accent: 'bg-slate-800 text-white', stage: 'Series A · Developer Tools · 55 people', title: 'AI Product Engineer — Evals', location: 'Remote', salary: '$105k – $135k', stretch: ['OpenTelemetry', 'Hybrid Search'] },
  ];

  function handleGenerateJobs(e: Event) {
    e.preventDefault();
    const count = Math.max(1, Math.min(10, Number(genCount) || 1));
    const cats: MockJob['category'][] = ['Backend', 'Fullstack', 'Platform', 'AI Systems'];
    const personas: MockJob['persona'][] = ['Friendly', 'Standard', 'Skeptical Staff'];

    const batch: MockJob[] = Array.from({ length: count }, (_, idx) => {
      const tpl = GENERATED_POOL[idx % GENERATED_POOL.length];
      const category = genCategory === 'Mixed' ? cats[idx % cats.length] : genCategory;
      const persona = personas[idx % personas.length];
      return {
        id: `gen-${Date.now()}-${idx}`,
        company: tpl.company,
        initials: tpl.initials,
        accent: tpl.accent,
        companyStage: tpl.stage,
        title: tpl.title,
        location: tpl.location,
        salary: tpl.salary,
        postedAgo: 'Just now',
        category,
        persona,
        matchPercent: 78 + ((idx * 3) % 8),
        matchedSkills: ['Go', 'Python', 'FastAPI', 'PostgreSQL', 'TypeScript', 'Docker'],
        stretchSkills: tpl.stretch,
        totalMinutes: 100,
        stages: [
          { name: 'HR / Recruiter Screen', interviewerRole: 'Technical Recruiter', minutes: 15, focus: 'Background, motivation & role alignment' },
          { name: 'Technical Interview', interviewerRole: `Senior ${category} Engineer`, minutes: 30, focus: 'Core stack depth, debugging & practical tradeoffs' },
          { name: 'System Design', interviewerRole: 'Staff Engineer', minutes: 30, focus: `Architecture scaling & ${tpl.stretch.join(' / ')}` },
          { name: 'Final — Hiring Manager', interviewerRole: 'Engineering Manager', minutes: 25, focus: 'Ownership, past impact (STAR) & your questions' },
        ],
        summary: `You will work on core ${category.toLowerCase()} systems at ${tpl.company}, owning reliability, latency budgets, and production architecture alongside a lean engineering team.`,
        responsibilities: [
          'Own core services, data models, and reliability targets end-to-end.',
          'Profile latency bottlenecks and improve throughput under peak traffic.',
          'Collaborate across engineering and product on architecture reviews.',
        ],
        requirements: [
          'Strong hands-on experience matching your core resume stack.',
          'Clear communication around tradeoffs, debugging, and testing.',
        ],
        stretchNotes: tpl.stretch.map(
          (tech) => `Working familiarity or first-principles reasoning with ${tech}.`
        ),
        companyProfile: {
          tagline: `Modern ${category.toLowerCase()} software built for high-growth teams.`,
          industry: `Software Development · ${category}`,
          companySize: '51–200 employees',
          hq: tpl.location.split('·')[0].trim(),
          founded: '2022',
          stage: tpl.stage.split('·')[0].trim(),
          website: `${tpl.company.toLowerCase().replace(/\s+/g, '')}.io`,
          about: [
            `${tpl.company} builds reliable ${category.toLowerCase()} products used by engineering and operations teams across APAC and global markets.`,
            'We are a remote-friendly company focused on clean architecture, transparent communication, and empowering small teams to ship meaningful work.',
          ],
          products: [
            {
              name: `${tpl.company} Platform`,
              description: `Core ${category.toLowerCase()} platform powering customer workflows at scale.`,
            },
            {
              name: `${tpl.company} Console`,
              description: 'Self-serve web dashboard, reporting, and developer APIs.',
            },
          ],
          cultureAndBenefits: [
            'Remote-friendly schedule with flexible hours and strong written communication.',
            'Competitive salary, equity, health coverage, and annual learning stipend.',
          ],
          locations: [tpl.location.split('·')[0].trim(), 'Remote'],
          specialties: [category, 'Go', 'Python', 'PostgreSQL', 'TypeScript', ...tpl.stretch],
        },
      };
    });

    jobs = genReplaceFeed ? batch : [...batch, ...jobs];
    selectedJobId = batch[0].id;
    activeNav = 'jobs';
    selectedCategory = 'All';
    showNewJobModal = false;
    notify(`Generated ${count} new job ${count === 1 ? 'listing' : 'listings'} from your CV.`);
  }

  function notify(msg: string) {
    toast = msg;
    setTimeout(() => {
      if (toast === msg) toast = null;
    }, 3000);
  }

  function resetFilters() {
    searchQuery = '';
    selectedCategory = 'All';
    activeNav = 'jobs';
  }
</script>

{#if activeCall}
  {@const callApp = applications.find((a) => a.id === activeCall?.appId)}
  {#if callApp}
    <VoiceCallView
      application={callApp}
      stageIndex={activeCall.stageIndex}
      job={jobs.find((j) => j.id === callApp.jobId) ?? null}
      onUpdateNotes={(notes) => handleUpdateAppNotes(callApp.id, notes)}
      onCancelLobby={() => (activeCall = null)}
      onFinishCall={handleFinishCall}
    />
  {/if}
{:else}
<div class="flex h-screen overflow-hidden bg-white text-neutral-900 antialiased">
  <!-- Left Sidebar -->
  <aside class="flex w-60 shrink-0 flex-col border-r border-neutral-200 bg-[#fafaf9]">
    <!-- Brand -->
    <div class="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
      <div class="flex items-center gap-2.5">
        <img src="/logo.svg" alt="Rehearse AI" class="h-7 w-7 rounded-md" />
        <span class="text-sm font-semibold tracking-tight text-neutral-900">Rehearse AI</span>
      </div>
      <span class="text-[11px] font-medium text-neutral-400">v0.1</span>
    </div>

    <!-- Navigation -->
    <div class="flex-1 overflow-y-auto px-3 py-4">
      <div class="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        Workspace
      </div>
      <nav class="mt-2 space-y-0.5">
        <button
          type="button"
          onclick={() => (activeNav = 'dashboard')}
          class="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs font-medium transition {activeNav === 'dashboard'
            ? 'bg-neutral-200/75 text-neutral-900'
            : 'text-neutral-600 hover:bg-neutral-200/40 hover:text-neutral-900'}"
        >
          <span class="flex items-center gap-2.5">
            <LayoutDashboard class="h-4 w-4 text-neutral-500" />
            Dashboard
          </span>
        </button>

        <button
          type="button"
          onclick={() => (activeNav = 'jobs')}
          class="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs font-medium transition {activeNav === 'jobs'
            ? 'bg-neutral-200/75 text-neutral-900'
            : 'text-neutral-600 hover:bg-neutral-200/40 hover:text-neutral-900'}"
        >
          <span class="flex items-center gap-2.5">
            <Briefcase class="h-4 w-4 text-neutral-500" />
            Browse Jobs
          </span>
          <span class="text-[11px] text-neutral-500">{jobs.length}</span>
        </button>

        <button
          type="button"
          onclick={() => {
            interviewDetailOpen = false;
            activeNav = 'interviews';
          }}
          class="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs font-medium transition {activeNav === 'interviews'
            ? 'bg-neutral-200/75 text-neutral-900'
            : 'text-neutral-600 hover:bg-neutral-200/40 hover:text-neutral-900'}"
        >
          <span class="flex items-center gap-2.5">
            <PhoneCall class="h-4 w-4 text-neutral-500" />
            Interviews
          </span>
          <span class="text-[11px] text-neutral-500">{ongoingInterviewsCount}</span>
        </button>

        <button
          type="button"
          onclick={() => (activeNav = 'resume')}
          class="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs font-medium transition {activeNav === 'resume'
            ? 'bg-neutral-200/75 text-neutral-900'
            : 'text-neutral-600 hover:bg-neutral-200/40 hover:text-neutral-900'}"
        >
          <span class="flex items-center gap-2.5">
            <FileText class="h-4 w-4 text-neutral-500" />
            Resume
          </span>
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        </button>
      </nav>
    </div>

    <!-- Bottom Settings Footer -->
    <div class="border-t border-neutral-200 p-3">
      <button
        type="button"
        onclick={() => (activeNav = 'settings')}
        class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition {activeNav === 'settings'
          ? 'bg-neutral-200/75 text-neutral-900'
          : 'text-neutral-600 hover:bg-neutral-200/40 hover:text-neutral-900'}"
      >
        <Settings class="h-4 w-4 text-neutral-500" />
        Settings
      </button>
    </div>
  </aside>

  <!-- Right Workspace Area -->
  <div class="flex min-w-0 flex-1 flex-col">
    <!-- Unified Top Bar (identical structure on every page) -->
    <header class="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-neutral-200 bg-white px-6">
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm font-semibold tracking-tight text-neutral-900">
          {#if activeNav === 'dashboard'}
            Dashboard
          {:else if activeNav === 'interviews'}
            Interviews
          {:else if activeNav === 'resume'}
            Resume
          {:else if activeNav === 'settings'}
            Settings
          {:else}
            Browse Jobs
          {/if}
        </h1>
        {#if activeNav === 'jobs' || activeNav === 'interviews'}
          <span class="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
            {activeNav === 'interviews' ? applications.length : filteredJobs.length}
          </span>
        {/if}
      </div>

      {#if activeNav === 'jobs'}
        <Button variant="primary" size="sm" onclick={() => (showNewJobModal = true)}>
          <Plus class="h-3.5 w-3.5" />
          New Job Listing
        </Button>
      {/if}
    </header>

    {#if activeNav === 'dashboard'}
      <DashboardView
        {applications}
        {jobs}
        onStartStage={(app, idx) => (activeCall = { appId: app.id, stageIndex: idx })}
        onOpenApplication={(appId) => {
          selectedAppId = appId;
          interviewDetailOpen = true;
          activeNav = 'interviews';
        }}
        onOpenJob={(jobId) => {
          selectedJobId = jobId;
          detailTab = 'job';
          activeNav = 'jobs';
        }}
        onGoToJobs={() => (activeNav = 'jobs')}
        onGoToInterviews={() => {
          interviewDetailOpen = false;
          activeNav = 'interviews';
        }}
      />
    {:else if activeNav === 'interviews'}
      <InterviewsView
        {applications}
        {jobs}
        selectedId={selectedAppId}
        detailOpen={interviewDetailOpen}
        onDetailOpenChange={(open) => (interviewDetailOpen = open)}
        onSelect={(id) => (selectedAppId = id)}
        onStartStage={(app, idx) => (activeCall = { appId: app.id, stageIndex: idx })}
        onWithdraw={handleWithdrawApplication}
        onUpdateNotes={handleUpdateAppNotes}
        onRespondOffer={handleRespondOffer}
      />
    {:else if activeNav === 'resume'}
      <ResumeView
        cvText={mockCvText}
        lastSaved={resumeLastSaved}
        onSave={(text) => {
          mockCvText = text;
          resumeLastSaved = 'Just now';
          notify('Resume saved.');
        }}
        onNotify={notify}
      />
    {:else if activeNav === 'settings'}
      <SettingsView
        settings={appSettings}
        onSave={(next) => {
          appSettings = next;
          notify('Settings saved.');
        }}
      />
    {:else}
    <!-- Unified Subbar (h-11, #fafaf9) -->
    <div class="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-[#fafaf9] px-6 py-2">
      <div class="flex flex-wrap items-center gap-1.5">
        {#each CATEGORIES as cat}
          <button
            type="button"
            onclick={() => (selectedCategory = cat)}
            class="rounded-md px-2.5 py-1 text-xs font-medium transition {selectedCategory === cat
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900'}"
          >
            {cat}
          </button>
        {/each}
      </div>

      <div class="flex items-center gap-2">
        <div class="relative w-56 sm:w-64">
          <Search class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <Input
            bind:value={searchQuery}
            type="text"
            placeholder="Search roles, company, stack..."
            class="py-1 pl-8 pr-7"
          />
          {#if searchQuery}
            <button
              type="button"
              onclick={() => (searchQuery = '')}
              class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            >
              <X class="h-3.5 w-3.5" />
            </button>
          {/if}
        </div>

        {#if selectedCategory !== 'All' || searchQuery}
          <Button variant="ghost" size="xs" onclick={resetFilters}>Reset</Button>
        {/if}
      </div>
    </div>

    <!-- 2-Pane Content: Job List + Detail -->
    <div class="flex min-h-0 flex-1 overflow-hidden">
      <!-- Middle Pane: Job Feed -->
      <section class="w-full shrink-0 overflow-y-auto border-r border-neutral-200 bg-white md:w-[370px] lg:w-[400px]">
        {#if filteredJobs.length === 0}
          <div class="p-8 text-center">
            <p class="text-xs text-neutral-500">No roles match your current filters.</p>
            <button
              type="button"
              onclick={resetFilters}
              class="mt-3 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Reset filters
            </button>
          </div>
        {:else}
          <div class="divide-y divide-neutral-200">
            {#each filteredJobs as job}
              {@const isSelected = selectedJob.id === job.id}
              <div
                role="button"
                tabindex="0"
                onclick={() => {
                  selectedJobId = job.id;
                  detailTab = 'job';
                }}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectedJobId = job.id;
                    detailTab = 'job';
                  }
                }}
                class="cursor-pointer p-4 transition {isSelected
                  ? 'bg-neutral-100/90'
                  : 'bg-white hover:bg-neutral-50'}"
              >
                <div class="flex items-start gap-3">
                  <div
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold {job.accent}"
                  >
                    {job.initials}
                  </div>
                  <div class="min-w-0">
                    <div class="text-xs font-medium text-neutral-500">
                      {job.company} · {job.postedAgo}
                    </div>
                    <h2 class="mt-0.5 text-sm font-semibold leading-snug text-neutral-900">
                      {job.title}
                    </h2>
                  </div>
                </div>

                <div class="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-neutral-500">
                  <span>{job.location}</span>
                  <span>·</span>
                  <span class="font-medium text-neutral-700">{job.salary}</span>
                </div>

                <div class="mt-2.5 flex flex-wrap gap-1">
                  {#each job.matchedSkills.slice(0, 3) as skill}
                    <span class="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-700">
                      {skill}
                    </span>
                  {/each}
                  {#each job.stretchSkills.slice(0, 2) as gap}
                    <span class="rounded border border-dashed border-neutral-300 px-1.5 py-0.5 text-[11px] text-neutral-500">
                      {gap}
                    </span>
                  {/each}
                </div>

                <div class="mt-2.5 flex items-center justify-between text-[11px] text-neutral-500">
                  <span class="font-medium text-emerald-700">{job.matchPercent}% match</span>
                  <span>
                    {job.stages.length} rounds
                    {#if job.pastScore !== undefined}
                      · Score {job.pastScore}
                    {/if}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </section>

      <!-- Right Pane: Job Detail -->
      <section class="hidden flex-1 overflow-y-auto bg-[#fafaf9] p-6 md:block lg:p-8">
        <article class="mx-auto max-w-2xl rounded-lg border border-neutral-200 bg-white p-6">
          <!-- Detail Header -->
          <div class="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-5">
            <div class="flex items-start gap-3.5">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-semibold {selectedJob.accent}"
              >
                {selectedJob.initials}
              </div>
              <div>
                <div class="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                  <Building2 class="h-3.5 w-3.5" />
                  <button
                    type="button"
                    onclick={() => (detailTab = 'company')}
                    class="font-medium text-neutral-700 underline-offset-2 hover:text-neutral-900 hover:underline"
                  >
                    {selectedJob.company}
                  </button>
                  <span>·</span>
                  <span>{selectedJob.companyStage}</span>
                </div>
                <h1 class="mt-1 text-lg font-semibold tracking-tight text-neutral-900">
                  {selectedJob.title}
                </h1>
                <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                  <span class="inline-flex items-center gap-1">
                    <MapPin class="h-3.5 w-3.5" />
                    {selectedJob.location}
                  </span>
                  <span class="font-medium text-neutral-800">{selectedJob.salary}</span>
                  <span class="inline-flex items-center gap-1">
                    <Clock class="h-3.5 w-3.5" />
                    {selectedJob.stages.length} interview rounds
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Button variant="primary" size="md" onclick={() => handleApplyToJob(selectedJob)}>
                <PhoneCall class="h-3.5 w-3.5" />
                {applications.some((a) => a.jobId === selectedJob.id) ? 'View Application' : 'Apply & Interview'}
              </Button>
            </div>
          </div>

          <!-- Detail Tabs: Job Description | Company -->
          <Tabs
            class="mt-4"
            items={[
              { id: 'job', label: 'Job Description' },
              { id: 'company', label: `Company (${selectedJob.company})` },
            ]}
            active={detailTab}
            onChange={(id) => (detailTab = id as 'job' | 'company')}
          />

          {#if detailTab === 'job'}
            <!-- Resume Fit -->
            <div class="mt-5 grid grid-cols-1 gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-2">
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

            <!-- Description -->
            <div class="mt-6 space-y-5 border-t border-neutral-200 pt-5 text-sm leading-relaxed text-neutral-700">
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
          {:else}
            {@const cp = selectedJob.companyProfile}
            <!-- Public Company Page View -->
            <div class="mt-5 space-y-6 text-sm leading-relaxed text-neutral-700">
              <!-- About -->
              <div>
                <p class="text-sm font-medium text-neutral-900">{cp.tagline}</p>
                <div class="mt-2.5 space-y-2.5 text-neutral-600">
                  {#each cp.about as paragraph}
                    <p>{paragraph}</p>
                  {/each}
                </div>
              </div>

              <!-- Standard Job-Board Company Details -->
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

              <!-- What We Build -->
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

              <!-- Culture & Benefits -->
              <div>
                <h3 class="text-sm font-semibold text-neutral-900">Culture & Benefits</h3>
                <ul class="mt-2 list-disc space-y-1.5 pl-5 text-xs text-neutral-700">
                  {#each cp.cultureAndBenefits as item}
                    <li>{item}</li>
                  {/each}
                </ul>
              </div>

              <!-- Locations & Specialties -->
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
        </article>
      </section>
    </div>
    {/if}
  </div>

  <!-- Toast -->
  {#if toast}
    <div class="fixed bottom-5 right-5 z-50 rounded-md bg-neutral-900 px-3.5 py-2 text-xs font-medium text-white shadow-lg">
      {toast}
    </div>
  {/if}

  <!-- New Job Listing Modal (CV-only generator) -->
  <Modal
    open={showNewJobModal}
    maxWidth="md"
    title="Generate Job Listings"
    description="Generated from your saved resume (~80% match / ~20% stretch)."
    onClose={() => (showNewJobModal = false)}
  >
    <form onsubmit={handleGenerateJobs}>
      <div class="space-y-4">
        <div>
          <div class="flex items-center justify-between text-xs font-medium text-neutral-700">
            <span>How many jobs to generate</span>
            <span class="font-mono text-neutral-900">{genCount}</span>
          </div>
          <div class="mt-2 grid grid-cols-4 gap-1.5">
            {#each [3, 5, 8, 10] as n}
              <Button
                variant={genCount === n ? 'primary' : 'secondary'}
                size="sm"
                onclick={() => (genCount = n)}
              >
                {n} jobs
              </Button>
            {/each}
          </div>
        </div>

        <Select label="Department" bind:value={genCategory}>
          <option value="Mixed">Mixed (All)</option>
          <option value="Backend">Backend</option>
          <option value="Fullstack">Fullstack</option>
          <option value="Platform">Platform</option>
          <option value="AI Systems">AI Systems</option>
        </Select>

        <label class="flex items-center gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            bind:checked={genReplaceFeed}
            class="h-3.5 w-3.5 rounded border-neutral-300 accent-neutral-900"
          />
          Replace current job feed
        </label>
      </div>

      <div class="mt-5 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onclick={() => (showNewJobModal = false)}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm">
          Generate {genCount} {genCount === 1 ? 'Job' : 'Jobs'}
        </Button>
      </div>
    </form>
  </Modal>

</div>
{/if}
