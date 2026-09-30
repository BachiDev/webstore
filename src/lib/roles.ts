// src/lib/roles.ts — subscription role hierarchy (pure helpers).

/** Subscription plan rank: higher unlocks everything below it. */
const ROLE_RANK: Record<string, number> = {
  Starter: 1,
  Pro: 2,
  Premium: 3,
};

export function roleRank(role: string | null | undefined): number {
  if (!role) return 0;
  return ROLE_RANK[role] ?? 0;
}

/** Highest-ranked role wins when a customer holds several subscriptions. */
export function pickHighestRole(roles: Array<string | null | undefined>): string | null {
  let best: string | null = null;
  for (const role of roles) {
    if (role && roleRank(role) > roleRank(best)) {
      best = role;
    }
  }
  return best;
}
