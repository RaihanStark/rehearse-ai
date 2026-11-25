<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Check, FileText, Loader2, Trash2, Upload } from 'lucide-svelte';
  import { Badge, Button, Card, Skeleton, Tabs, Textarea } from './ui';

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
  let extracting = $state(false);
  let saving = $state(false);

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
    'Go', 'Python', 'FastAPI', 'TypeScript', 'JavaScript', 'Svelte', 'React',
    'Next.js', 'Tailwind CSS', 'PostgreSQL', 'SQLite', 'MySQL', 'Redis',
    'Docker', 'Kubernetes', 'Linux', 'gRPC', 'GraphQL', 'Kafka', 'Rust',
    'C++', 'AWS', 'WebSockets', 'WebRTC',
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
      extracting = true;
      const objectUrl = URL.createObjectURL(file);
      uploadedFile = {
        name: file.name,
        sizeKb: Math.max(1, Math.round(file.size / 1024)),
        uploadedAt: 'Just now',
        objectUrl,
      };
      activeTab = 'pdf';
      await new Promise((r) => setTimeout(r, 900));
      extracting = false;
      onNotify(`Uploaded ${file.name} and extracted resume text.`);
    } else if (lower.endsWith('.txt') || lower.endsWith('.md')) {
      extracting = true;
      const content = await file.text();
      await new Promise((r) => setTimeout(r, 450));
      draft = content.trim();
      uploadedFile = {
        name: file.name,
        sizeKb: Math.max(1, Math.round(file.size / 1024)),
        uploadedAt: 'Just now',
        objectUrl: null,
      };
      activeTab = 'text';
      extracting = false;
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

  async function handleSave() {
    if (draft.trim().length < 20) {
      onNotify('Please add at least a short summary of your experience.');
      return;
    }
    saving = true;
    await new Promise((r) => setTimeout(r, 450));
    onSave(draft.trim());
    saving = false;
  }

  onDestroy(() => {
    if (uploadedFile?.objectUrl) {
      URL.revokeObjectURL(uploadedFile.objectUrl);
    }
  });
</script>

<div class="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#fafaf9]">
  <!-- Unified Subbar -->
  <div class="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-[#fafaf9] px-6 py-2">
    <div class="flex items-center gap-3 text-xs text-neutral-500">
      <span>{wordCount} words</span>
      <span>·</span>
      <span>{detectedSkills.length} detected skills</span>
      <span>·</span>
      <span>Last saved {lastSaved}</span>
    </div>

    <div class="flex items-center gap-2">
      <label class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50">
        <Upload class="h-3.5 w-3.5 text-neutral-500" />
        Upload PDF / MD / TXT
        <input type="file" accept=".pdf,.md,.txt" onchange={handleFileInput} hidden />
      </label>

      {#if activeTab === 'text'}
        <Button variant="primary" size="sm" loading={saving} onclick={handleSave} disabled={!isDirty}>
          {#if !saving}
            <Check class="h-3.5 w-3.5" />
          {/if}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      {/if}
    </div>
  </div>

  <!-- Main Content -->
  <div class="flex-1 overflow-y-auto px-6 py-6">
    <div class="mx-auto grid max-w-5xl grid-cols-1 items-start gap-5 lg:grid-cols-12">
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
                <Button variant="danger-subtle" size="icon" onclick={removeFile} aria-label="Remove file">
                  <Trash2 class="h-3.5 w-3.5" />
                </Button>
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
        <Card padding="none">
          <div class="flex items-center justify-between px-5 pt-3">
            <Tabs
              items={[
                { id: 'pdf', label: 'PDF Preview' },
                { id: 'text', label: 'Extracted Text' },
              ]}
              active={activeTab}
              onChange={(id) => (activeTab = id as 'pdf' | 'text')}
              class="flex-1"
            />
            {#if activeTab === 'text'}
              <span class="border-b border-neutral-200 pb-2.5 pl-4 text-[11px] {isDirty ? 'font-medium text-amber-600' : 'text-emerald-700'}">
                {isDirty ? 'Unsaved changes' : 'Saved'}
              </span>
            {/if}
          </div>

          <div class="p-5">
            {#if extracting}
              <div class="space-y-3 py-8">
                <div class="flex items-center gap-2 text-xs font-medium text-neutral-600">
                  <Loader2 class="h-4 w-4 animate-spin text-neutral-500" />
                  Extracting text and detecting skills from resume...
                </div>
                <Skeleton class="h-3.5 w-3/4" />
                <Skeleton class="h-3.5 w-full" />
                <Skeleton class="h-3.5 w-5/6" />
                <Skeleton class="h-3.5 w-2/3" />
              </div>
            {:else if activeTab === 'pdf'}
              {#if uploadedFile?.objectUrl}
                <iframe
                  title="Resume PDF Preview"
                  src={uploadedFile.objectUrl}
                  class="h-[560px] w-full rounded-md border border-neutral-200 bg-neutral-50"
                ></iframe>
              {:else}
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
                      <p class="mt-1 text-neutral-600">{detectedSkills.join(' · ')}</p>
                    </div>
                  </div>

                  <div class="mt-6 border-t border-neutral-100 pt-3 text-center text-[11px] text-neutral-400">
                    Upload any local .pdf above to preview your actual file right here.
                  </div>
                </div>
              {/if}
            {:else}
              <Textarea
                bind:value={draft}
                mono
                rows={18}
                placeholder="Paste or edit the extracted text from your resume..."
                class="resize-y p-4"
              />
            {/if}
          </div>
        </Card>
      </div>

      <!-- Right: Parsed Profile Summary -->
      <aside class="space-y-4 lg:col-span-4">
        <Card>
          <div class="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            Profile Summary
          </div>
          <div class="mt-2 text-sm font-semibold text-neutral-900">{headline}</div>
          <p class="mt-1.5 text-xs leading-relaxed text-neutral-500">
            Job listings and interview questions are generated from your resume (~80% matching your stack, ~20% unfamiliar stretch topics).
          </p>
        </Card>

        <Card>
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
                <Badge size="sm">{skill}</Badge>
              {/each}
            </div>
          {/if}
        </Card>
      </aside>
    </div>
  </div>
</div>
