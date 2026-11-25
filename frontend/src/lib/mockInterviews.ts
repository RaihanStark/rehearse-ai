export type StageStatus = 'completed' | 'current' | 'upcoming';
export type StageOutcome = 'passed' | 'rejected';

export interface TranscriptEntry {
  time: string;
  speaker: 'interviewer' | 'you';
  text: string;
  tag?: string;
}

export interface SessionLogEntry {
  time: string;
  event: string;
  detail: string;
}

export interface AnswerRewrite {
  question: string;
  issue: string;
  strongerAnswer: string;
}

export interface RoundReview {
  completedAt: string;
  actualDuration: string;
  rubric: { label: string; score: number }[];
  strengths: string[];
  improvements: string[];
  rewrites: AnswerRewrite[];
  transcript: TranscriptEntry[];
  logs: SessionLogEntry[];
}

export interface ApplicationStage {
  name: string;
  interviewerRole: string;
  minutes: number;
  focus: string;
  status: StageStatus;
  outcome?: StageOutcome;
  score?: number;
  note?: string;
  review?: RoundReview;
}

export interface OfferDetails {
  level: string;
  baseSalary: string;
  equity: string;
  bonus: string;
  startWindow: string;
  hiringManagerName: string;
  hiringManagerTitle: string;
  hiringManagerNote: string;
  decision?: 'accepted' | 'declined';
}

export interface MockApplication {
  id: string;
  jobId: string;
  company: string;
  initials: string;
  accent: string;
  title: string;
  location: string;
  status: 'ongoing' | 'ready' | 'offer' | 'rejected';
  appliedAgo: string;
  lastActivity: string;
  overallScore?: number;
  verdict?: string;
  rejectionReason?: string;
  offerDetails?: OfferDetails;
  prepNotes: string;
  stages: ApplicationStage[];
  feedbackHighlights?: {
    strengths: string[];
    improvements: string[];
  };
}

export const INITIAL_APPLICATIONS: MockApplication[] = [
  {
    id: 'app-paypulse',
    jobId: 'paypulse-senior-be',
    company: 'PayPulse',
    initials: 'PP',
    accent: 'bg-neutral-900 text-white',
    title: 'Senior Backend Engineer — Core Payments',
    location: 'Singapore · Remote (APAC)',
    status: 'ongoing',
    appliedAgo: 'Yesterday',
    lastActivity: '2 hours ago',
    prepNotes:
      'Review Postgres serializable vs read-committed locks, idempotency key storage, and read up on Kafka outbox pattern basics.',
    stages: [
      {
        name: 'HR / Recruiter Screen',
        interviewerRole: 'Technical Recruiter',
        minutes: 15,
        focus: 'Background, motivation for PayPulse, role expectations',
        status: 'completed',
        outcome: 'passed',
        score: 86,
        note: 'Clear motivation and background summary; good questions about team structure.',
        review: {
          completedAt: 'Today, 11:20',
          actualDuration: '14m 18s',
          rubric: [
            { label: 'Clarity & Pacing', score: 88 },
            { label: 'Role Alignment', score: 87 },
            { label: 'Company Motivation', score: 85 },
            { label: 'Communication', score: 84 },
          ],
          strengths: [
            'Concise 90-second career summary tying Go/Python backend work directly to payment reliability.',
            'Referenced PayPulse’s multi-currency APAC settlement rails naturally when asked "Why PayPulse?".',
            'Asked thoughtful questions about squad ownership and on-call cadence.',
          ],
          improvements: [
            'When mentioning latency improvements, state the baseline and final numbers up front (e.g., 180ms → 105ms p99).',
            'Keep the transition between your previous two roles tighter—spent ~20s too long on early career context.',
          ],
          rewrites: [
            {
              question: 'Can you walk me through your most impactful backend project?',
              issue: 'Started with tool names instead of the business problem and measurable outcome.',
              strongerAnswer:
                'At my last role, checkout API p99 latency was spiking during peak traffic and causing retries. I profiled the Postgres hot queries, added composite indexes and a Redis read-through cache, and cut p99 latency by 40% at 2k RPS.',
            },
          ],
          transcript: [
            {
              time: '00:08',
              speaker: 'interviewer',
              text: 'Hi Raihan, thanks for taking the time today. To kick things off, could you give me a quick overview of your background and what caught your eye about PayPulse?',
            },
            {
              time: '00:22',
              speaker: 'you',
              text: 'Thanks for having me. I have about four years of experience building backend services in Go and Python, mostly around PostgreSQL, Redis, and high-throughput APIs. I saw PayPulse is scaling cross-border B2B settlements across APAC, and working on ledger reliability at that scale is the exact problem space I want to go deeper into.',
              tag: 'Strong intro',
            },
            {
              time: '01:05',
              speaker: 'interviewer',
              text: 'That aligns well. What was the hardest reliability or performance problem you owned recently?',
            },
            {
              time: '01:14',
              speaker: 'you',
              text: 'We had a payment microservice that slowed down whenever traffic spiked. I used Redis caching and tuned our SQL indexes, which brought p99 latency down by about 40 percent.',
              tag: 'Could add baseline',
            },
            {
              time: '01:48',
              speaker: 'interviewer',
              text: 'Nice result. One thing on this role—our ledger team uses Apache Kafka and Temporal heavily. Have you worked with either in production?',
            },
            {
              time: '02:01',
              speaker: 'you',
              text: 'I have not run Temporal or Kafka in production yet—I have mostly used Redis streams and Postgres-backed job queues. From what I understand, Kafka gives durable partitioned logs for replayability and Temporal handles durable retries, so I am comfortable ramping up quickly on both.',
              tag: 'Honest stretch answer',
            },
            {
              time: '12:40',
              speaker: 'interviewer',
              text: 'Before we wrap up, what questions do you have for me about the team or hiring process?',
            },
            {
              time: '12:51',
              speaker: 'you',
              text: 'How are the backend squads structured around PulseLedger versus InstantFX, and what does the on-call rotation look like for a senior engineer?',
              tag: 'Good Q&A',
            },
          ],
          logs: [
            { time: '00:00', event: 'call.started', detail: 'Connected · Technical Recruiter · 15m budget' },
            { time: '01:48', event: 'probe.stretch', detail: 'Interviewer introduced stretch stack: Apache Kafka, Temporal' },
            { time: '06:12', event: 'vad.barge_in', detail: 'Candidate interrupted mid-sentence (audio cleared in 90ms)' },
            { time: '12:40', event: 'phase.qa', detail: 'Transitioned to candidate Q&A (~2m remaining)' },
            { time: '14:18', event: 'call.completed', detail: '16 turns · avg STT 0.36s · avg TTS first-audio 1.5s' },
          ],
        },
      },
      {
        name: 'Technical Interview',
        interviewerRole: 'Senior Backend Engineer',
        minutes: 30,
        focus: 'Go/Python depth, Postgres transactions, Redis caching, debugging',
        status: 'current',
      },
      {
        name: 'System Design',
        interviewerRole: 'Staff Engineer',
        minutes: 30,
        focus: 'Designing idempotent payment rails & event-driven settlement (Kafka/Temporal)',
        status: 'upcoming',
      },
      {
        name: 'Final — Hiring Manager',
        interviewerRole: 'Engineering Manager',
        minutes: 25,
        focus: 'Ownership, past impact (STAR), team culture & your questions',
        status: 'upcoming',
      },
    ],
  },
  {
    id: 'app-kestrel',
    jobId: 'kestrel-platform',
    company: 'Kestrel Cloud',
    initials: 'KC',
    accent: 'bg-emerald-900 text-white',
    title: 'Backend / Platform Engineer — Edge Telemetry',
    location: 'Remote (Global)',
    status: 'ready',
    appliedAgo: 'Today',
    lastActivity: 'Just applied',
    prepNotes: 'Prepare 2-min intro covering Go/Linux work and why Kestrel Cloud stands out.',
    stages: [
      {
        name: 'HR / Recruiter Screen',
        interviewerRole: 'Talent Partner',
        minutes: 15,
        focus: 'Experience overview, remote work setup, timeline',
        status: 'current',
      },
      {
        name: 'Technical Interview',
        interviewerRole: 'Senior Platform Engineer',
        minutes: 30,
        focus: 'Go concurrency, Linux troubleshooting, profiling bottlenecks',
        status: 'upcoming',
      },
      {
        name: 'System Design',
        interviewerRole: 'Staff Infrastructure Engineer',
        minutes: 30,
        focus: 'High-volume telemetry ingestion, ClickHouse storage & Kubernetes',
        status: 'upcoming',
      },
      {
        name: 'Final — Engineering Leadership',
        interviewerRole: 'VP of Engineering',
        minutes: 25,
        focus: 'Technical ownership, incident handling, roadmap Q&A',
        status: 'upcoming',
      },
    ],
  },
  {
    id: 'app-veloce',
    jobId: 'veloce-ai-fullstack',
    company: 'Veloce AI',
    initials: 'VA',
    accent: 'bg-blue-900 text-white',
    title: 'Fullstack Engineer — Realtime Voice Studio',
    location: 'San Francisco / Remote',
    status: 'offer',
    appliedAgo: '3 days ago',
    lastActivity: '2 days ago',
    overallScore: 86,
    verdict: 'Offer Extended',
    offerDetails: {
      level: 'Senior Fullstack Engineer (IC4)',
      baseSalary: '$142,000 / yr',
      equity: '0.35% (4-yr vest, 1-yr cliff)',
      bonus: '$10,000 sign-on',
      startWindow: 'Flexible (30 days notice)',
      hiringManagerName: 'Samir Patel',
      hiringManagerTitle: 'Co-founder & CTO, Veloce AI',
      hiringManagerNote:
        'The whole team really enjoyed talking with you across all four rounds. Your clarity on async streaming architecture, Svelte 5 state design, and honest first-principles reasoning on WebRTC stood out. We would love to have you help us build Veloce Studio.',
    },
    prepNotes: 'Focus on Svelte 5 reactive state + FastAPI WebSocket streaming latency.',
    stages: [
      {
        name: 'Intro Call',
        interviewerRole: 'Founding Recruiter',
        minutes: 15,
        focus: 'Why Veloce AI, fullstack background, startup pace',
        status: 'completed',
        outcome: 'passed',
        score: 88,
        note: 'Strong product intuition and concise delivery.',
        review: {
          completedAt: '3 days ago',
          actualDuration: '13m 45s',
          rubric: [
            { label: 'Clarity', score: 90 },
            { label: 'Startup Fit', score: 88 },
            { label: 'Role Alignment', score: 86 },
          ],
          strengths: [
            'Clear motivation for working end-to-end across Python and Svelte.',
            'Direct, low-fluff answers well suited to an early-stage team.',
          ],
          improvements: ['Mention one example of working directly with end-user feedback.'],
          rewrites: [],
          transcript: [
            {
              time: '00:05',
              speaker: 'interviewer',
              text: 'Hey Raihan! Tell me a bit about what draws you to a small voice-AI team like Veloce.',
            },
            {
              time: '00:14',
              speaker: 'you',
              text: 'I enjoy owning both the streaming backend and the UI, especially when latency directly shapes how the product feels.',
              tag: 'Strong alignment',
            },
          ],
          logs: [
            { time: '00:00', event: 'call.started', detail: 'Connected · Founding Recruiter · 15m budget' },
            { time: '13:45', event: 'call.completed', detail: '14 turns · avg STT 0.34s' },
          ],
        },
      },
      {
        name: 'Fullstack Technical Round',
        interviewerRole: 'Senior Fullstack Engineer',
        minutes: 30,
        focus: 'Svelte 5 state, TypeScript, FastAPI async streaming',
        status: 'completed',
        outcome: 'passed',
        score: 90,
        note: 'Clean explanation of sentence buffering and barge-in cancellation.',
        review: {
          completedAt: '2 days ago',
          actualDuration: '28m 50s',
          rubric: [
            { label: 'Backend Async Depth', score: 92 },
            { label: 'Frontend State Design', score: 90 },
            { label: 'Tradeoff Reasoning', score: 88 },
          ],
          strengths: [
            'Explained asyncio task cancellation cleanly for instant voice barge-in.',
            'Good intuition on why Svelte 5 runes simplify audio queue & WebSocket state.',
          ],
          improvements: [
            'Discuss backpressure handling when TTS synthesis falls behind LLM token streaming.',
          ],
          rewrites: [
            {
              question: 'How would you prevent stale audio chunks from playing after a user interrupts?',
              issue: 'Mentioned clearing the browser queue, but missed tagging chunks with a monotonically increasing turn_id.',
              strongerAnswer:
                'On barge-in I cancel the active backend asyncio task, stop and flush the browser audio queue immediately, and tag every outbound audio chunk with a monotonically increasing turn_id so late in-flight packets from the cancelled turn are dropped on arrival.',
            },
          ],
          transcript: [
            {
              time: '04:12',
              speaker: 'interviewer',
              text: 'Walk me through how you stream tokens from an LLM into TTS without waiting for the entire response.',
            },
            {
              time: '04:21',
              speaker: 'you',
              text: 'I buffer incoming text deltas until a sentence boundary like a period or question mark, then immediately dispatch that sentence to TTS while the LLM keeps streaming the next sentence.',
              tag: 'Crisp explanation',
            },
          ],
          logs: [
            { time: '00:00', event: 'call.started', detail: 'Connected · Senior Fullstack Engineer · 30m budget' },
            { time: '16:30', event: 'probe.deep_dive', detail: 'Probed race conditions on WebSocket barge-in' },
            { time: '28:50', event: 'call.completed', detail: '29 turns · avg STT 0.39s' },
          ],
        },
      },
      {
        name: 'Architecture & Voice Deep Dive',
        interviewerRole: 'CTO',
        minutes: 25,
        focus: 'End-to-end voice latency, WebRTC/LiveKit & ONNX tradeoffs',
        status: 'completed',
        outcome: 'passed',
        score: 79,
        note: 'Reasoned well from first principles on WebRTC TURN/ICE.',
        review: {
          completedAt: '2 days ago',
          actualDuration: '24m 10s',
          rubric: [
            { label: 'System Architecture', score: 82 },
            { label: 'Stretch Handling (WebRTC)', score: 78 },
            { label: 'Latency Analysis', score: 77 },
          ],
          strengths: [
            'Broke down the latency budget clearly into VAD, STT, TTFT, and TTS.',
            'Honest about limited hands-on WebRTC TURN experience while reasoning cleanly about UDP vs TCP head-of-line blocking.',
          ],
          improvements: [
            'Quantify worst-case tail latency (p95/p99) rather than only median latency.',
          ],
          rewrites: [],
          transcript: [
            {
              time: '08:04',
              speaker: 'interviewer',
              text: 'When would you migrate from WebSockets to WebRTC for a voice agent?',
            },
            {
              time: '08:15',
              speaker: 'you',
              text: 'WebSockets are simpler for an MVP, but on lossy mobile networks TCP retransmissions stall audio. WebRTC over UDP lets you drop stale frames and adds built-in echo cancellation.',
              tag: 'Good first principles',
            },
          ],
          logs: [
            { time: '00:00', event: 'call.started', detail: 'Connected · CTO · 25m budget' },
            { time: '24:10', event: 'call.completed', detail: '22 turns · avg STT 0.41s' },
          ],
        },
      },
      {
        name: 'Founder Culture Chat',
        interviewerRole: 'CEO',
        minutes: 20,
        focus: 'Product sense, customer empathy, company vision',
        status: 'completed',
        outcome: 'passed',
        score: 87,
        note: 'Asked sharp questions about customer onboarding and latency budgets.',
        review: {
          completedAt: '2 days ago',
          actualDuration: '18m 40s',
          rubric: [
            { label: 'Product Sense', score: 88 },
            { label: 'Ownership', score: 86 },
            { label: 'Culture Fit', score: 87 },
          ],
          strengths: ['Thoughtful product questions tied to Veloce Studio’s coaching workflow.'],
          improvements: ['Share a concrete story of disagreeing with a product spec and resolving it.'],
          rewrites: [],
          transcript: [
            {
              time: '03:10',
              speaker: 'interviewer',
              text: 'What makes an interactive AI practice tool something people actually come back to every day?',
            },
            {
              time: '03:20',
              speaker: 'you',
              text: 'Low friction to start and feedback that is specific enough to immediately fix your next answer.',
              tag: 'Strong product sense',
            },
          ],
          logs: [
            { time: '00:00', event: 'call.started', detail: 'Connected · CEO · 20m budget' },
            { time: '18:40', event: 'call.completed', detail: '15 turns · avg STT 0.35s' },
          ],
        },
      },
    ],
    feedbackHighlights: {
      strengths: [
        'Crisp, concrete examples grounded in real latency measurements.',
        'Handled unfamiliar WebRTC questions honestly instead of bluffing.',
      ],
      improvements: [
        'Quantify business/user impact earlier when introducing past projects.',
        'Slow down slightly when walking through multi-step async flows.',
      ],
    },
  },
  {
    id: 'app-cinderdb',
    jobId: 'cinderdb-backend',
    company: 'CinderDB',
    initials: 'CD',
    accent: 'bg-red-900 text-white',
    title: 'Distributed Systems Engineer — Storage & Sync',
    location: 'Remote (EU / APAC)',
    status: 'rejected',
    appliedAgo: '5 days ago',
    lastActivity: '4 days ago',
    overallScore: 58,
    verdict: 'Rejected at Round 2',
    rejectionReason:
      'Strong Go fundamentals, but needed deeper familiarity with SQLite WAL checkpointing, fsync durability guarantees, and crash-recovery edge cases.',
    prepNotes: 'Study SQLite WAL file format, fsync ordering, and Raft log compaction before applying to storage roles.',
    stages: [
      {
        name: 'Recruiter Screen',
        interviewerRole: 'Technical Recruiter',
        minutes: 15,
        focus: 'Systems background, remote timezone fit, process overview',
        status: 'completed',
        outcome: 'passed',
        score: 80,
        note: 'Good communication and strong Go/Linux background.',
      },
      {
        name: 'Systems & Storage Interview',
        interviewerRole: 'Senior Systems Engineer',
        minutes: 30,
        focus: 'Go concurrency, SQLite WAL internals, disk I/O',
        status: 'completed',
        outcome: 'rejected',
        score: 58,
        note: 'Struggled on WAL checkpoint starvation and fsync durability guarantees under power loss.',
        review: {
          completedAt: '4 days ago',
          actualDuration: '29m 12s',
          rubric: [
            { label: 'Go Concurrency', score: 78 },
            { label: 'Storage Internals', score: 48 },
            { label: 'Failure Mode Reasoning', score: 52 },
            { label: 'Clarity', score: 66 },
          ],
          strengths: [
            'Clean explanation of Go goroutine cancellation and channel backpressure.',
          ],
          improvements: [
            'Avoid guessing when unsure about OS page cache vs fsync durability—reason from first principles instead.',
            'Review how SQLite WAL mode handles concurrent readers during checkpointing.',
          ],
          rewrites: [
            {
              question: 'What happens if the machine loses power right after SQLite writes a commit frame to the WAL?',
              issue: 'Assumed the OS flushes writes immediately once write() returns.',
              strongerAnswer:
                'A write() syscall only copies data into the kernel page cache. Without an fsync() on the WAL file (and directory on creation), a power loss can drop or reorder those pages—so SQLite relies on fsync with synchronous=FULL or NORMAL to guarantee durability.',
            },
          ],
          transcript: [
            {
              time: '11:20',
              speaker: 'interviewer',
              text: 'If a long-running read transaction stays open in SQLite WAL mode, what happens to the WAL file size?',
            },
            {
              time: '11:34',
              speaker: 'you',
              text: 'I think SQLite automatically rotates it into a new file so it does not grow forever.',
              tag: 'Incorrect — probed',
            },
          ],
          logs: [
            { time: '00:00', event: 'call.started', detail: 'Connected · Senior Systems Engineer · 30m budget' },
            { time: '29:12', event: 'round.rejected', detail: 'Score 58/100 (below 65 pass threshold) · Pipeline closed' },
          ],
        },
      },
      {
        name: 'Distributed Design Round',
        interviewerRole: 'Staff Distributed Systems Engineer',
        minutes: 35,
        focus: 'Multi-region replication, split-brain recovery & Raft consensus',
        status: 'upcoming',
      },
      {
        name: 'Final — CTO & Values',
        interviewerRole: 'CTO',
        minutes: 25,
        focus: 'Engineering bar, debugging philosophy & open Q&A',
        status: 'upcoming',
      },
    ],
  },
];
