// #4471 split by what each report shows, not by its subject line. Pages explain it; this file is what runs.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift';

// One ticket per problem, filed in the public repo that holds this kb.
// `state` follows engineering's update on #4471 (closed 5 Oct 2026).
export const PROBLEMS: readonly { problem: Problem; title: string; issue: number; state: 'fixed' | "won't fix" | 'open'; why: string }[] = [
  { problem: 'parser', title: 'Shared parser reads day-first dates month first', issue: 1, state: 'fixed', why: 'fix(dates): parse dd/mm for eu locales' },
  { problem: 'hint', title: 'booking-v3 date hint says MM/DD/YYYY to day-first tenants', issue: 2, state: "won't fix", why: 'booking-v3 form retired' },
  { problem: 'shift', title: 'Bookings move one day back (timezone)', issue: 3, state: 'open', why: 'no fix yet: neither change above touches it' },
];

export const ISSUES = 'https://github.com/przemokam/mega-what-it-shows/issues';

// Counted the way the desk counts (CauseTable, desk-notes.json): every report under the cause it is
// filed under by tenant. A one-day move (desk-notes.json) is its own problem too: the day moved, the
// month did not. Those reports also stay counted where they are filed, as the desk footnotes them.
export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
  // For `shift`: how many of its reports are also counted under each filed cause.
  alsoFiled: Record<string, number>;
};

function group(problem: ProblemGroup['problem'], rs: Report[], filed: (r: Report) => string): ProblemGroup {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
    channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
    alsoFiled: problem === 'shift' ? rs.reduce<Record<string, number>>((n, r) => ({ ...n, [filed(r)]: (n[filed(r)] ?? 0) + 1 }), {}) : {},
  };
}

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: Report[]; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const filed = (r: Report) => causeOf(r, tenantOf(r)) ?? 'unplaced';
  const groups = [
    group('parser', merged.filter((r) => filed(r) === 'parser'), filed),
    group('hint', merged.filter((r) => filed(r) === 'hint'), filed),
    group('shift', merged.filter((r) => oneDayMove.includes(r.id)), filed),
    group('unplaced', merged.filter((r) => filed(r) === 'unplaced'), filed),
  ];
  return { merged, groups: groups.filter((g) => g.reports.length > 0) };
}
