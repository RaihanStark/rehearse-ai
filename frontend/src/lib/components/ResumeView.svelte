<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Check, FileText, Trash2, Upload } from 'lucide-svelte';

  interface Props {
    cvText: string;
    lastSaved: string;
    onSave: (text: string) => void;
    onNotify: (msg: string) => void;
  }

  let { cvText, lastSaved, onSave, onNotify }: Props = $props();

  let draft = $state('');
  let initialized = $state(false);
  let activeTab = $state<'pdf' | 'text'>('pdf');
  let dragging = $state(false);

  let uploadedFile = $state<{
    name: string;
    sizeKb: number;
    uploadedAt: string;
    objectUrl: string | null;
  } | null>({
    name: 'Raihan_Resume_2026.pdf',
    sizeKb: 148,
    uploadedAt: 'Today',
    objectUrl: null,
  });

  $effect(() => {
    if (!initialized) {
      draft = cvText;
      initialized = true;
    }
  });

  let isDirty = $derived(draft.trim() !== cvText.trim());
  let wordCount = $derived(draft.trim() ? draft.trim().split(/\s+/).length : 0);

  const KNOWN_SKILLS = [
    'Go',
    'Python',
    'FastAPI',
    'TypeScript',
    'JavaScript',
    'Svelte',
    'React',
    'Next.js',
    'Tailwind CSS',
    'PostgreSQL',
    'SQLite',
    'MySQL',
    'Redis',
    'Docker',
    'Kubernetes',
    'Linux',
    'gRPC',
    'GraphQL',
    'Kafka',
    'Rust',
    'C++',
    'AWS',
    'WebSockets',
    'WebRTC',
  ];

  let detectedSkills = $derived(
    KNOWN_SKILLS.filter((skill) =>
      draft.toLowerCase().includes(skill.toLowerCase())
    )
  );

  let headline = $derived(
    draft
      .split('\n')
      .map((l) => l.trim())
      .find((l) => l.length > 0) ?? 'Untitled Resume'
  );

  async function processFile(file: File) {
    const lower = file.name.toLowerCase();
    if (uploadedFile?.objectUrl) {
      URL.revokeObjectURL(uploadedFile.objectUrl);
    }

    if (lower.endsWith('.pdf')) {
      const objectUrl = URL.createObjectURL(file);
      uploadedFile = {
        name: file.name,
        sizeKb: Math.max(1, Math.round(file.size / 1024)),
        uploadedAt: 'Just now',
        objectUrl,
      };
      activeTab = 'pdf';
      onNotify(`Uploaded ${file.name} (PDF preview ready; text extraction will run via backend).`);
    } else if (lower.endsWith('.txt') || lower.endsWith('.md')) {
      const content = await file.text();
      draft = content.trim();
      uploadedFile = {
        name: file.name,
        sizeKb: Math.max(1, Math.round(file.size / 1024)),
        uploadedAt: 'Just now',
        objectUrl: null,
      };
      activeTab = 'text';
      onSave(draft);
      onNotify(`Loaded ${file.name}.`);
    } else {
      onNotify('Please upload a .pdf, .md, or .txt file.');
    }
  }

  async function handleFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) await processFile(file);
    input.value = '';
  }

  async function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) await processFile(file);
  }

  function removeFile() {
    if (uploadedFile?.objectUrl) {
      URL.revokeObjectURL(uploadedFile.objectUrl);
    }
    uploadedFile = null;
    onNotify('Removed attached resume file.');
  }

  function handleSave() {
    if (draft.trim().length < 20) {
      onNotify('Please add at least a short summary of your experience.');
      return;
    }
    onSave(draft.trim());
  }

  onDestroy(() => {
    if (uploadedFile?.objectUrl) {
      URL.revokeObjectURL(uploadedFile.objectUrl);
    }
  });
</script>

<div class="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#fafaf9]">
  <!-- Unified Subbar (h-11, #fafaf9) -->
  <div class="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-[#fafaf9] px-6 py-2">
    <div class="flex items-center gap-3 text-xs text-neutral-500">
      <span>{wordCount} words</span>
      <span>·</span>
      <span>{detectedSkills.length} detected skills</span>
      <span>·</span>
      <span>Last saved {lastSaved}</span>
    </div>

    <div class="flex items-center gap-2">
      <label class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50">
        <Upload class="h-3.5 w-3.5 text-neutral-500" />
        Upload PDF / MD / TXT
        <input type="file" accept=".pdf,.md,.txt" onchange={handleFileInput} hidden />
      </label>

      {#if activeTab === 'text'}
        <button
          type="button"
          onclick={handleSave}
          disabled={!isDirty}
          class="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:opacity-40"
        >
          <Check class="h-3.5 w-3.5" />
          Save Changes
        </button>
      {/if}
    </div>
  </div>

  <!-- Main Content -->
  <div class="flex-1 overflow-y-auto px-6 py-6">
    <div class="mx-auto grid max-w-5xl grid-cols-1 items-start gap-5 lg:grid-cols-12">
      <!-- Left: PDF Upload & Preview / Extracted Text -->
      <div class="space-y-4 lg:col-span-8">
        <!-- Attached File Card / Dropzone -->
        <div
          role="region"
          aria-label="Resume upload dropzone"
          ondragover={(e) => {
            e.preventDefault();
            dragging = true;
          }}
          ondragleave={() => (dragging = false)}
          ondrop={handleDrop}
          class="rounded-lg border bg-white p-4 transition {dragging
            ? 'border-neutral-900 bg-neutral-50'
            : 'border-neutral-200'}"
        >
          {#if uploadedFile}
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-700">
                  <FileText class="h-5 w-5" />
                </div>
                <div>
                  <div class="text-xs font-semibold text-neutral-900">{uploadedFile.name}</div>
                  <div class="text-[11px] text-neutral-400">
                    {uploadedFile.sizeKb} KB · Uploaded {uploadedFile.uploadedAt}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <label class="cursor-pointer rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50">
                  Replace
                  <input type="file" accept=".pdf,.md,.txt" onchange={handleFileInput} hidden />
                </label>
                <button
                  type="button"
                  onclick={removeFile}
                  aria-label="Remove file"
                  class="rounded-md border border-neutral-200 p-1.5 text-neutral-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          {:else}
            <label class="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50/70 px-4 py-8 text-center transition hover:border-neutral-400 hover:bg-neutral-50">
              <Upload class="h-5 w-5 text-neutral-400" />
              <div class="mt-2 text-xs font-medium text-neutral-800">
                Drop your resume PDF here, or click to browse
              </div>
              <div class="mt-0.5 text-[11px] text-neutral-400">
                Supports PDF, Markdown (.md), or plain text (.txt)
              </div>
              <input type="file" accept=".pdf,.md,.txt" onchange={handleFileInput} hidden />
            </label>
          {/if}
        </div>

        <!-- Tabs: PDF Preview | Extracted Text -->
        <section class="rounded-lg border border-neutral-200 bg-white">
          <div class="flex items-center justify-between border-b border-neutral-200 px-5 pt-3">
            <div class="flex items-center gap-5 text-xs font-medium">
              <button
                type="button"
                onclick={() => (activeTab = 'pdf')}
                class="-mb-px border-b-2 pb-2.5 transition {activeTab === 'pdf'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'}"
              >
                PDF Preview
              </button>
              <button
                type="button"
                onclick={() => (activeTab = 'text')}
                class="-mb-px border-b-2 pb-2.5 transition {activeTab === 'text'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'}"
              >
                Extracted Text
              </button>
            </div>

            {#if activeTab === 'text'}
              <span class="pb-2 text-[11px] {isDirty ? 'font-medium text-amber-600' : 'text-emerald-700'}">
                {isDirty ? 'Unsaved changes' : 'Saved'}
              </span>
            {/if}
          </div>

          <div class="p-5">
            {#if activeTab === 'pdf'}
              {#if uploadedFile?.objectUrl}
                <iframe
                  title="Resume PDF Preview"
                  src={uploadedFile.objectUrl}
                  class="h-[560px] w-full rounded-md border border-neutral-200 bg-neutral-50"
                ></iframe>
              {:else}
                <!-- Clean Paper Document Mock Preview -->
                <div class="mx-auto max-w-xl rounded-md border border-neutral-200 bg-[#fcfcfb] p-7 shadow-xs">
                  <div class="border-b border-neutral-200 pb-4">
                    <div class="text-base font-bold tracking-tight text-neutral-900">
                      {headline}
                    </div>
                    <div class="mt-1 text-xs text-neutral-500">
                      Jakarta, Indonesia · dev@byraihan.com · github.com/RaihanStark
                    </div>
                  </div>

                  <div class="mt-4 space-y-4 text-xs leading-relaxed text-neutral-700">
                    <div>
                      <div class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        Experience
                      </div>
                      <ul class="mt-1.5 list-disc space-y-1.5 pl-4">
                        <li>Built payment and ledger microservices handling 2k+ RPS with Go and PostgreSQL.</li>
                        <li>Reduced p99 API latency by 40% via composite indexing and Redis read-through caching.</li>
                        <li>Shipped interactive real-time web interfaces using Svelte, TypeScript, and Tailwind CSS.</li>
                      </ul>
                    </div>

                    <div>
                      <div class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        Core Technical Stack
                      </div>
                      <p class="mt-1 text-neutral-600">
                        {detectedSkills.join(' · ')}
                      </p>
                    </div>
                  </div>

                  <div class="mt-6 border-t border-neutral-100 pt-3 text-center text-[11px] text-neutral-400">
                    Upload any local .pdf above to preview your actual file right here.
                  </div>
                </div>
              {/if}
            {:else}
              <textarea
                bind:value={draft}
                rows="18"
                placeholder="Paste or edit the extracted text from your resume..."
                class="w-full resize-y rounded-md border border-neutral-200 bg-neutral-50 p-4 font-mono text-xs leading-relaxed text-neutral-800 outline-none transition focus:border-neutral-400 focus:bg-white"
              ></textarea>
            {/if}
          </div>
        </section>
      </div>

      <!-- Right: Parsed Profile Summary -->
      <aside class="space-y-4 lg:col-span-4">
        <section class="rounded-lg border border-neutral-200 bg-white p-5">
          <div class="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            Profile Summary
          </div>
          <div class="mt-2 text-sm font-semibold text-neutral-900">
            {headline}
          </div>
          <p class="mt-1.5 text-xs leading-relaxed text-neutral-500">
            Job listings and interview questions are generated from your resume (~80% matching your stack, ~20% unfamiliar stretch topics).
          </p>
        </section>

        <section class="rounded-lg border border-neutral-200 bg-white p-5">
          <div class="flex items-center justify-between">
            <h3 class="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              Detected Skills
            </h3>
            <span class="text-[11px] text-neutral-400">{detectedSkills.length}</span>
          </div>

          {#if detectedSkills.length === 0}
            <p class="mt-2 text-xs text-neutral-400">
              Add technologies (e.g. Go, Python, PostgreSQL, Svelte) to your resume text.
            </p>
          {:else}
            <div class="mt-3 flex flex-wrap gap-1.5">
              {#each detectedSkills as skill}
                <span class="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                  {skill}
                </span>
              {/each}
            </div>
          {/if}
        </section>
      </aside>
    </div>
  </div>
</div>
