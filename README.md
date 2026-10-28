# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

---

## #4471 split (added 2026-10-28)

Ticket #4471 merged 412 reports by subject line. Read by what each report shows, it is three
problems, filed as issues in this repo:

- [#1](../../issues/1) `parser` — shared parser reads day-first dates month first
- [#2](../../issues/2) `hint` — `booking-v3` date hint says `MM/DD/YYYY` to day-first tenants
- [#3](../../issues/3) `shift` — bookings move one day back (timezone)

The kb page about them: [`src/routes/kb/incidents/4471/split/+page.svx`](src/routes/kb/incidents/4471/split/+page.svx).
As the desk sees it: [`rendered/kb/incidents/4471/split/index.html`](rendered/kb/incidents/4471/split/index.html)
(screenshot: [`docs/split-page.png`](docs/split-page.png)). Counts are computed at render time by
`src/lib/kb/split.ts` and `src/lib/kb/ProblemSplit.svelte`.

Render it yourself: `npm install && npm run build` (SvelteKit 3 + mdsvex, output in `rendered/`).
