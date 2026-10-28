// #4471 split by what each report shows, not by its subject line. Pages explain it; this file is what runs.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift';

// One ticket per problem, filed in the public repo that holds this kb.
export const PROBLEMS: readonly { problem: Problem; title: string; issue: number }[] = [
  { problem: 'parser', title: 'Shared parser reads day-first dates month first', issue: 1 },
  { problem: 'hint', title: 'booking-v3 date hint says MM/DD/YYYY to day-first tenants', issue: 2 },
  { problem: 'shift', title: 'Bookings move one day back (timezone)', issue: 3 },
];

export const ISSUES = 'https://github.com/przemokam/mega-what-it-shows/issues';

// A report the desk read as a one-day move (desk-notes.json) is not a flip: the day moved, the month
// did not. That is its own problem, whatever its tenant's form says. Everything else keeps the cause
// causes.ts gives it.
export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem | 'unplaced' {
  if (oneDayMove.includes(r.id)) return 'shift';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: Report[]; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const order = [...PROBLEMS.map((p) => p.problem), 'unplaced'];
  const groups = [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => order.indexOf(a.problem) - order.indexOf(b.problem));
  return { merged, groups };
}
