export interface InterviewStage {
  name: string;
  interviewerRole: string;
  minutes: number;
  focus: string;
}

export interface CompanyProfile {
  tagline: string;
  industry: string;
  companySize: string;
  hq: string;
  founded: string;
  stage: string;
  website: string;
  about: string[];
  products: { name: string; description: string }[];
  cultureAndBenefits: string[];
  locations: string[];
  specialties: string[];
}

export interface MockJob {
  id: string;
  company: string;
  initials: string;
  accent: string;
  companyStage: string;
  title: string;
  location: string;
  salary: string;
  postedAgo: string;
  category: 'Backend' | 'Fullstack' | 'Platform' | 'AI Systems';
  persona: 'Friendly' | 'Standard' | 'Skeptical Staff';
  matchPercent: number;
  matchedSkills: string[];
  stretchSkills: string[];
  totalMinutes: number;
  stages: InterviewStage[];
  summary: string;
  responsibilities: string[];
  requirements: string[];
  stretchNotes: string[];
  pastScore?: number;
  companyProfile: CompanyProfile;
}

export const MOCK_JOBS: MockJob[] = [
  {
    id: 'paypulse-senior-be',
    company: 'PayPulse',
    initials: 'PP',
    accent: 'bg-neutral-900 text-white',
    companyStage: 'Series B · Fintech · 140 people',
    title: 'Senior Backend Engineer — Core Payments',
    location: 'Singapore · Remote (APAC)',
    salary: '$115k – $145k',
    postedAgo: '2h ago',
    category: 'Backend',
    persona: 'Standard',
    matchPercent: 82,
    matchedSkills: ['Go', 'Python', 'PostgreSQL', 'Redis', 'Docker', 'REST/gRPC'],
    stretchSkills: ['Apache Kafka', 'Temporal'],
    totalMinutes: 100,
    stages: [
      { name: 'HR / Recruiter Screen', interviewerRole: 'Technical Recruiter', minutes: 15, focus: 'Background, motivation for PayPulse, role expectations' },
      { name: 'Technical Interview', interviewerRole: 'Senior Backend Engineer', minutes: 30, focus: 'Go/Python depth, Postgres transactions, Redis caching, debugging' },
      { name: 'System Design', interviewerRole: 'Staff Engineer', minutes: 30, focus: 'Designing idempotent payment rails & event-driven settlement (Kafka/Temporal)' },
      { name: 'Final — Hiring Manager', interviewerRole: 'Engineering Manager', minutes: 25, focus: 'Ownership, past impact (STAR), team culture & your questions' },
    ],
    summary:
      'PayPulse processes $4B+ in cross-border B2B settlements annually. You will own low-latency ledger APIs, payment orchestration pipelines, and reliability under peak traffic.',
    responsibilities: [
      'Design and scale idempotent payment & settlement microservices handling 5k+ RPS.',
      'Optimize PostgreSQL queries, indexing strategies, and Redis caching layers for sub-50ms p99.',
      'Collaborate with risk and compliance teams on auditable double-entry ledger workflows.',
      'Participate in architecture reviews, incident postmortems, and on-call reliability improvements.',
    ],
    requirements: [
      '4+ years building production backend services in Go or Python.',
      'Strong mastery of PostgreSQL transactions, isolation levels, and query tuning.',
      'Hands-on experience with Redis, Docker, and high-availability REST/gRPC APIs.',
    ],
    stretchNotes: [
      'Production event streaming with Apache Kafka (consumer groups, outbox pattern, DLQs).',
      'Durable workflow execution using Temporal for multi-step settlement retries.',
    ],
    pastScore: 78,
    companyProfile: {
      tagline: 'Cross-border payment infrastructure for modern businesses across Asia-Pacific.',
      industry: 'Financial Services · Fintech',
      companySize: '51–200 employees',
      hq: 'Singapore',
      founded: '2021',
      stage: 'Series B',
      website: 'paypulse.io',
      about: [
        'PayPulse makes it simple for businesses across Asia-Pacific to send, receive, and reconcile multi-currency payments through a single API. Today, hundreds of marketplaces, logistics networks, and global payroll platforms rely on our rails to move money reliably across 14 markets.',
        'We are a remote-friendly engineering-led company headquartered in Singapore. We value clear written communication, thoughtful system design, and small autonomous teams that own their work from idea to production.',
      ],
      products: [
        {
          name: 'PulseLedger',
          description: 'Real-time multi-currency ledger and reconciliation platform for finance and treasury teams.',
        },
        {
          name: 'InstantFX',
          description: 'API-driven cross-border payouts with transparent FX rates and local clearing support.',
        },
      ],
      cultureAndBenefits: [
        'Remote-first across APAC (UTC+6 to UTC+9) with quarterly team offsites in Singapore.',
        'Comprehensive medical, dental, and mental health coverage.',
        'Annual $2,000 learning, conference, and home-office stipend.',
        'Competitive base salary plus meaningful equity ownership.',
      ],
      locations: ['Singapore (HQ)', 'Jakarta', 'Remote (APAC)'],
      specialties: ['Payments', 'Cross-Border FX', 'B2B Fintech', 'API Infrastructure', 'Go', 'PostgreSQL'],
    },
  },
  {
    id: 'kestrel-platform',
    company: 'Kestrel Cloud',
    initials: 'KC',
    accent: 'bg-emerald-900 text-white',
    companyStage: 'Series C · Developer Infra · 260 people',
    title: 'Backend / Platform Engineer — Edge Telemetry',
    location: 'Remote (Global)',
    salary: '$130k – $165k',
    postedAgo: '5h ago',
    category: 'Platform',
    persona: 'Skeptical Staff',
    matchPercent: 79,
    matchedSkills: ['Go', 'Linux', 'Docker', 'PostgreSQL', 'SQL'],
    stretchSkills: ['ClickHouse', 'Kubernetes', 'eBPF'],
    totalMinutes: 100,
    stages: [
      { name: 'HR / Recruiter Screen', interviewerRole: 'Talent Partner', minutes: 15, focus: 'Experience overview, remote work setup, timeline' },
      { name: 'Technical Interview', interviewerRole: 'Senior Platform Engineer', minutes: 30, focus: 'Go concurrency, Linux troubleshooting, profiling bottlenecks' },
      { name: 'System Design', interviewerRole: 'Staff Infrastructure Engineer', minutes: 30, focus: 'High-volume telemetry ingestion, ClickHouse storage & Kubernetes' },
      { name: 'Final — Engineering Leadership', interviewerRole: 'VP of Engineering', minutes: 25, focus: 'Technical ownership, incident handling, roadmap Q&A' },
    ],
    summary:
      'Kestrel Cloud builds real-time observability for edge deployments. Our telemetry pipeline ingests 2M+ events/sec across 35 global PoPs with strict latency budgets.',
    responsibilities: [
      'Build high-throughput ingestion workers in Go with minimal GC pressure.',
      'Design scalable schemas and rollup pipelines for real-time customer dashboards.',
      'Debug tricky Linux networking, container memory limits, and tail-latency spikes.',
    ],
    requirements: [
      'Strong systems intuition in Go, Linux internals, and concurrent networking.',
      'Experience profiling CPU/memory bottlenecks and tuning SQL/storage engines.',
    ],
    stretchNotes: [
      'Operating ClickHouse clusters (MergeTree, materialized views, shard balancing).',
      'Kubernetes operators, pod scheduling, and basic eBPF observability concepts.',
    ],
    companyProfile: {
      tagline: 'Fast, predictable observability for cloud and edge engineering teams.',
      industry: 'Software Development · Cloud Infrastructure',
      companySize: '201–500 employees',
      hq: 'San Francisco, CA',
      founded: '2019',
      stage: 'Series C',
      website: 'kestrelcloud.dev',
      about: [
        'Kestrel Cloud builds logging, metrics, and distributed tracing tools designed for modern cloud-native teams. Over 1,200 engineering organizations use Kestrel to monitor production workloads across 35 global regions without unpredictable billing.',
        'Our team is globally distributed and async-first. We care deeply about performance, open-source contributions, and building developer tools we genuinely love using ourselves.',
      ],
      products: [
        {
          name: 'Kestrel Ingest',
          description: 'Lightweight telemetry collectors for Linux, Kubernetes, and edge runtimes.',
        },
        {
          name: 'FlameQuery',
          description: 'Fast log and trace exploration built for high-cardinality production debugging.',
        },
      ],
      cultureAndBenefits: [
        '100% remote worldwide with flexible working hours and no-meeting Wednesdays.',
        '25 days paid time off plus local public holidays.',
        '$3,000 workstation setup budget and annual education allowance.',
        'Full health insurance and company-wide annual retreats.',
      ],
      locations: ['San Francisco (HQ)', 'London', 'Remote (Global)'],
      specialties: ['Observability', 'Cloud Infrastructure', 'Developer Tools', 'Go', 'ClickHouse', 'Kubernetes'],
    },
  },
  {
    id: 'veloce-ai-fullstack',
    company: 'Veloce AI',
    initials: 'VA',
    accent: 'bg-blue-900 text-white',
    companyStage: 'Seed · Voice & Agents · 22 people',
    title: 'Fullstack Engineer — Realtime Voice Studio',
    location: 'San Francisco / Remote',
    salary: '$125k – $155k + equity',
    postedAgo: 'Today',
    category: 'AI Systems',
    persona: 'Friendly',
    matchPercent: 84,
    matchedSkills: ['Python', 'FastAPI', 'Svelte', 'TypeScript', 'Tailwind CSS', 'WebSockets'],
    stretchSkills: ['WebRTC / LiveKit', 'ONNX Runtime'],
    totalMinutes: 90,
    stages: [
      { name: 'Intro Call', interviewerRole: 'Founding Recruiter', minutes: 15, focus: 'Why Veloce AI, fullstack background, startup pace' },
      { name: 'Fullstack Technical Round', interviewerRole: 'Senior Fullstack Engineer', minutes: 30, focus: 'Svelte 5 state, TypeScript, FastAPI async streaming' },
      { name: 'Architecture & Voice Deep Dive', interviewerRole: 'CTO', minutes: 25, focus: 'End-to-end voice latency, WebRTC/LiveKit & ONNX tradeoffs' },
      { name: 'Founder Culture Chat', interviewerRole: 'CEO', minutes: 20, focus: 'Product sense, customer empathy, company vision' },
    ],
    summary:
      'Veloce AI builds ultra-low-latency voice agents for customer training and coaching. You will work end-to-end across our Python streaming backend and reactive Svelte frontend.',
    responsibilities: [
      'Ship snappy, accessible web interfaces in Svelte 5, TypeScript, and Tailwind CSS.',
      'Architect resilient async Python (FastAPI) streaming pipelines for LLM + audio orchestration.',
      'Measure and ruthlessly cut end-to-end voice turn latency below 600ms.',
    ],
    requirements: [
      'Experience building modern TypeScript SPAs and async Python backend APIs.',
      'Comfort owning features end-to-end from UI polish to database schema.',
    ],
    stretchNotes: [
      'WebRTC media transport (LiveKit / ICE / TURN) and audio worklet buffering.',
      'Running quantized speech/VAD models via ONNX Runtime in browser & server.',
    ],
    pastScore: 86,
    companyProfile: {
      tagline: 'Interactive voice simulation software for training customer-facing teams.',
      industry: 'Software Development · Applied AI',
      companySize: '11–50 employees',
      hq: 'San Francisco, CA',
      founded: '2024',
      stage: 'Seed',
      website: 'veloce.ai',
      about: [
        'Veloce AI builds real-time voice roleplay software that helps sales, support, and healthcare teams practice difficult conversations before they happen live. Our customers use Veloce to onboard new hires faster and give consistent, actionable coaching.',
        'We are a tight-knit early-stage team of 22 people who move quickly, talk directly with customers every week, and obsess over clean product craft.',
      ],
      products: [
        {
          name: 'Veloce Studio',
          description: 'Browser-based interactive voice simulation environment with live transcripts.',
        },
        {
          name: 'Coaching Scorecards',
          description: 'Structured feedback reports aligned to each customer’s internal playbooks.',
        },
      ],
      cultureAndBenefits: [
        'Remote-friendly with flexible hours and high individual ownership.',
        'Early-stage equity package alongside competitive base compensation.',
        'Full health, vision, and dental coverage + laptop & audio gear budget.',
      ],
      locations: ['San Francisco (HQ)', 'Remote'],
      specialties: ['Voice AI', 'WebRTC', 'Training & Coaching', 'Python', 'Svelte', 'TypeScript'],
    },
  },
  {
    id: 'northstar-fullstack',
    company: 'Northstar Commerce',
    initials: 'NC',
    accent: 'bg-stone-800 text-white',
    companyStage: 'Series A · E-Commerce · 65 people',
    title: 'Senior Fullstack Engineer — Checkout & Analytics',
    location: 'Jakarta · Hybrid / Remote',
    salary: '$75k – $105k',
    postedAgo: '1d ago',
    category: 'Fullstack',
    persona: 'Standard',
    matchPercent: 81,
    matchedSkills: ['TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Python', 'Redis'],
    stretchSkills: ['GraphQL Federation', 'Next.js Edge'],
    totalMinutes: 95,
    stages: [
      { name: 'HR / Recruiter Screen', interviewerRole: 'People Partner', minutes: 15, focus: 'Career goals, Jakarta/remote setup, compensation expectations' },
      { name: 'Technical Interview', interviewerRole: 'Tech Lead', minutes: 30, focus: 'TypeScript frontend performance, Postgres queries, Redis locking' },
      { name: 'System Design & Product Round', interviewerRole: 'Principal Engineer', minutes: 30, focus: 'Flash-sale checkout concurrency & GraphQL API architecture' },
      { name: 'Final — Hiring Manager', interviewerRole: 'Head of Engineering', minutes: 20, focus: 'Collaboration, past product wins, career growth' },
    ],
    summary:
      'Northstar powers headless checkout for 400+ Southeast Asian brands. You will build reliable checkout flows and merchant analytics that survive 10x flash-sale spikes.',
    responsibilities: [
      'Build conversion-critical checkout flows and merchant dashboards with clean UI.',
      'Prevent inventory overselling under flash-sale load using Postgres + Redis primitives.',
      'Partner closely with product and design on rapid weekly experiments.',
    ],
    requirements: [
      'Solid fullstack experience with TypeScript, SQL/PostgreSQL, and backend APIs.',
      'Track record of shipping user-facing features with measurable business outcomes.',
    ],
    stretchNotes: [
      'Schema stitching & N+1 mitigation in federated GraphQL gateways.',
      'Edge caching and streaming SSR patterns.',
    ],
    companyProfile: {
      tagline: 'Mobile-first checkout and analytics for Southeast Asian retail brands.',
      industry: 'E-Commerce · SaaS',
      companySize: '51–200 employees',
      hq: 'Jakarta, Indonesia',
      founded: '2022',
      stage: 'Series A',
      website: 'northstarcommerce.id',
      about: [
        'Northstar Commerce provides fast, localized checkout and merchant analytics for over 400 direct-to-consumer brands across Indonesia and Southeast Asia. We integrate local e-wallets, bank transfers, and courier rates into a seamless mobile experience.',
        'Based in South Jakarta with a flexible hybrid and remote setup, our team combines deep local commerce expertise with a strong product engineering culture.',
      ],
      products: [
        {
          name: 'Northstar Checkout',
          description: 'Fast one-page mobile checkout supporting QRIS, e-wallets, and instant shipping.',
        },
        {
          name: 'Merchant Pulse',
          description: 'Conversion funnel and campaign analytics dashboard for retail teams.',
        },
      ],
      cultureAndBenefits: [
        'Hybrid in South Jakarta (optional) or remote across Indonesia & SEA.',
        'Private health insurance, THR, performance bonuses, and employee stock options.',
        'Annual learning & certification allowance.',
      ],
      locations: ['Jakarta (HQ)', 'Remote (Indonesia / SEA)'],
      specialties: ['E-Commerce', 'Checkout Experience', 'Retail Analytics', 'TypeScript', 'PostgreSQL', 'Redis'],
    },
  },
  {
    id: 'cinderdb-backend',
    company: 'CinderDB',
    initials: 'CD',
    accent: 'bg-red-900 text-white',
    companyStage: 'Series B · Database Startup · 90 people',
    title: 'Distributed Systems Engineer — Storage & Sync',
    location: 'Remote (EU / APAC)',
    salary: '$140k – $180k',
    postedAgo: '2d ago',
    category: 'Backend',
    persona: 'Skeptical Staff',
    matchPercent: 76,
    matchedSkills: ['Go', 'SQLite', 'PostgreSQL', 'Linux', 'Git'],
    stretchSkills: ['Raft Consensus', 'Rust'],
    totalMinutes: 105,
    stages: [
      { name: 'Recruiter Screen', interviewerRole: 'Technical Recruiter', minutes: 15, focus: 'Systems background, remote timezone fit, process overview' },
      { name: 'Systems & Storage Interview', interviewerRole: 'Senior Systems Engineer', minutes: 30, focus: 'Go concurrency, SQLite WAL internals, disk I/O' },
      { name: 'Distributed Design Round', interviewerRole: 'Staff Distributed Systems Engineer', minutes: 35, focus: 'Multi-region replication, split-brain recovery & Raft consensus' },
      { name: 'Final — CTO & Values', interviewerRole: 'CTO', minutes: 25, focus: 'Engineering bar, debugging philosophy & open Q&A' },
    ],
    summary:
      'CinderDB turns local SQLite databases into globally replicated, edge-ready data layers. Expect a deep, no-fluff technical conversation focused on correctness and failure modes.',
    responsibilities: [
      'Design WAL shipping, snapshotting, and conflict-detection protocols in Go.',
      'Write deterministic simulation tests to catch rare race conditions and crashes.',
      'Benchmark disk I/O, fsync latency, and replication lag across regions.',
    ],
    requirements: [
      'Deep comfort with Go concurrency, SQLite/Postgres internals, and Linux.',
      'Strong habit of reasoning from first principles about network partitions.',
    ],
    stretchNotes: [
      'Raft consensus log compaction, membership changes, and linearizable reads.',
      'Interoperating with Rust storage engine crates via FFI.',
    ],
    companyProfile: {
      tagline: 'Edge-replicated SQLite databases built for low-latency global apps.',
      industry: 'Data Infrastructure · Developer Tools',
      companySize: '51–200 employees',
      hq: 'Berlin, Germany',
      founded: '2021',
      stage: 'Series B',
      website: 'cinderdb.com',
      about: [
        'CinderDB is a developer-focused database company bringing multi-region replication, branching, and managed backups to SQLite. Developers use CinderDB to place data close to their users without managing complex cluster operations.',
        'We operate as a remote-first engineering organization across Europe and APAC, prioritizing deep focus time, rigorous testing, and open technical writing.',
      ],
      products: [
        {
          name: 'Cinder Sync',
          description: 'Lightweight replication daemon that keeps local SQLite files synced globally.',
        },
        {
          name: 'Cinder Cloud',
          description: 'Managed multi-tenant database platform with instant branching and backups.',
        },
      ],
      cultureAndBenefits: [
        'Fully remote across EU & APAC timezones with two company retreats per year.',
        '30 days paid vacation plus local holidays.',
        'Dedicated hardware, book, and conference budget.',
      ],
      locations: ['Berlin (HQ)', 'Remote (EU / APAC)'],
      specialties: ['Databases', 'Distributed Systems', 'SQLite', 'Go', 'Rust', 'Linux'],
    },
  },
  {
    id: 'driftscale-ai',
    company: 'DriftScale',
    initials: 'DS',
    accent: 'bg-slate-800 text-white',
    companyStage: 'Series A · Applied AI · 45 people',
    title: 'AI Product Engineer — Evaluation & Workflows',
    location: 'Remote (APAC)',
    salary: '$105k – $135k',
    postedAgo: '3d ago',
    category: 'AI Systems',
    persona: 'Standard',
    matchPercent: 85,
    matchedSkills: ['Python', 'FastAPI', 'SQLite', 'TypeScript', 'LLM Prompting'],
    stretchSkills: ['OpenTelemetry', 'Vector Hybrid Search'],
    totalMinutes: 95,
    stages: [
      { name: 'HR / Recruiter Screen', interviewerRole: 'Talent Lead', minutes: 15, focus: 'AI product experience, background & role alignment' },
      { name: 'Technical Interview', interviewerRole: 'Senior AI Engineer', minutes: 30, focus: 'Python/FastAPI, structured LLM outputs, TypeScript UI' },
      { name: 'System Design — Evals & Tracing', interviewerRole: 'CTO', minutes: 30, focus: 'Eval pipelines, OpenTelemetry tracing & hybrid search' },
      { name: 'Final — Behavioral & Fit', interviewerRole: 'CEO', minutes: 20, focus: 'Ownership, shipping fast, product roadmap Q&A' },
    ],
    summary:
      'DriftScale helps engineering teams test, trace, and ship reliable AI agents in production. You will build evaluation pipelines, streaming UX, and cost/latency analytics.',
    responsibilities: [
      'Design reliable structured-output LLM pipelines and automated rubric graders.',
      'Build clean developer dashboards for inspecting multi-turn agent traces.',
      'Optimize prompt caching, model routing, and fallback strategies.',
    ],
    requirements: [
      'Strong Python + TypeScript skills and hands-on experience shipping LLM workflows.',
      'Pragmatic mindset around latency, cost control, and deterministic testing.',
    ],
    stretchNotes: [
      'Instrumenting distributed LLM spans with OpenTelemetry.',
      'Hybrid retrieval (BM25 + dense embeddings + reranking).',
    ],
    companyProfile: {
      tagline: 'Testing, tracing, and evaluation tools for production AI applications.',
      industry: 'Developer Tools · Artificial Intelligence',
      companySize: '11–50 employees',
      hq: 'Singapore',
      founded: '2023',
      stage: 'Series A',
      website: 'driftscale.ai',
      about: [
        'DriftScale builds developer tools that help software teams test, observe, and ship reliable AI features. From automated prompt regression suites to production trace inspection, our platform brings classic software engineering rigor to AI products.',
        'We are a small, collaborative team distributed across Singapore, India, and Southeast Asia.',
      ],
      products: [
        {
          name: 'DriftEval',
          description: 'Automated evaluation and regression testing integrated into CI/CD.',
        },
        {
          name: 'TraceLens',
          description: 'Latency, token usage, and step-by-step trace viewer for LLM apps.',
        },
      ],
      cultureAndBenefits: [
        'Remote across APAC with optional co-working hubs in Singapore.',
        'Competitive salary, equity, and $1,500/yr learning & AI tools budget.',
        'Flexible PTO and comprehensive health insurance.',
      ],
      locations: ['Singapore (HQ)', 'Remote (APAC)'],
      specialties: ['AI Evaluation', 'Observability', 'Developer Tools', 'Python', 'TypeScript', 'OpenTelemetry'],
    },
  },
];
