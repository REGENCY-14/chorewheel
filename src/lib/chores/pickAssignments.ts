export type Member = { id: string };
export type Chore = { id: string };
export type ChorePools = Record<string, string[]>;
export type LastAssigned = Record<string, string>;

export type Assignment = { choreId: string; memberId: string };

export type PickAssignmentsResult = {
  assignments: Assignment[];
  updatedPools: ChorePools;
};

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pickRandom<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

/**
 * Pure, unit-testable core of cycle generation. Assumes `pools` have already
 * been reset by the caller if the member roster changed since the last cycle
 * (see the reset rule in the household chore-rotation spec).
 */
export function pickAssignments(
  members: Member[],
  chores: Chore[],
  pools: ChorePools,
  lastAssigned: LastAssigned = {},
  random: () => number = Math.random
): PickAssignmentsResult {
  const updatedPools: ChorePools = {};
  for (const chore of chores) {
    updatedPools[chore.id] = [...(pools[chore.id] ?? [])];
  }

  if (members.length === 0) {
    return { assignments: [], updatedPools };
  }

  const memberIds = members.map((m) => m.id);
  const assignedCountThisCycle: Record<string, number> = {};
  for (const id of memberIds) assignedCountThisCycle[id] = 0;

  const assignments: Assignment[] = [];
  const shuffledChores = shuffle(chores, random);

  for (const chore of shuffledChores) {
    let pool = updatedPools[chore.id] ?? [];
    // Keep the pool honest against the current roster in case it went stale.
    pool = pool.filter((id) => memberIds.includes(id));

    if (pool.length === 0) {
      const excluded = memberIds.length > 1 ? lastAssigned[chore.id] : undefined;
      pool = memberIds.filter((id) => id !== excluded);
      if (pool.length === 0) {
        pool = [...memberIds];
      }
    }

    const minCount = Math.min(...pool.map((id) => assignedCountThisCycle[id]));
    const eligible = pool.filter((id) => assignedCountThisCycle[id] === minCount);
    const chosen = pickRandom(eligible, random);

    assignments.push({ choreId: chore.id, memberId: chosen });
    assignedCountThisCycle[chosen] += 1;
    updatedPools[chore.id] = pool.filter((id) => id !== chosen);
  }

  return { assignments, updatedPools };
}

/** Resets every chore's pool to the full current member list. Call this
 * whenever a member is added or removed, before the next generation. */
export function resetPoolsForRoster(chores: Chore[], members: Member[]): ChorePools {
  const memberIds = members.map((m) => m.id);
  const pools: ChorePools = {};
  for (const chore of chores) {
    pools[chore.id] = [...memberIds];
  }
  return pools;
}
