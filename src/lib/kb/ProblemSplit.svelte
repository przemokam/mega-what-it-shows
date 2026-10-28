<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { ISSUES, PROBLEMS, splitTicket } from '#lib/kb/split';

  let { ticket, examples = false }: { ticket: number; examples?: boolean } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const meta = (p: string) => PROBLEMS.find((x) => x.problem === p);
  const channels = (c: Record<string, number>) =>
    Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .map(([ch, n]) => `${ch} ×${n}`)
      .join(' · ');
  const known = $derived(split.groups.filter((g) => meta(g.problem)).length);
</script>

{#if !examples}
<p class="sum">
  <strong>{split.merged.length}</strong> reports merged into #{ticket} ·
  <strong>{known}</strong>
  {known === 1 ? 'problem' : 'problems'}, one ticket each
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>ticket</th><th>tenants</th><th>channels</th><th>seen</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      {@const m = meta(g.problem)}
      <tr class:unplaced={!m}>
        <td><code>{g.problem}</code>{#if m}<br /><span class="title">{m.title}</span>{/if}</td>
        <td><strong>{g.reports.length}</strong></td>
        <td>{#if m}<a href="{ISSUES}/{m.issue}">#{m.issue}</a>{:else}none yet{/if}</td>
        <td>{g.tenants.length}</td>
        <td class="small">{channels(g.channels)}</td>
        <td class="small">{g.firstSeen} → {g.lastSeen}</td>
      </tr>
    {/each}
  </tbody>
</table>
{:else}
  {#each split.groups as g (g.problem)}
    {@const r = g.reports[0]}
    <blockquote>
      <code>{g.problem}</code> · {r.id} · {r.tenant} ({tenantOf(r)?.locale}, {tenantOf(r)?.form}) via {r.channel}:
      “{r.body}”
    </blockquote>
  {/each}
{/if}

<style>
  .sum { font-size: 1.1rem; }
  .title { color: var(--muted); font-size: 0.85em; }
  .small { color: var(--muted); font-size: 0.85em; }
  .unplaced td { background: var(--warn-bg); }
  blockquote { margin: 0.5rem 0; padding: 0.25rem 0.75rem; border-left: 3px solid var(--line); color: var(--muted); font-size: 0.9em; }
</style>
