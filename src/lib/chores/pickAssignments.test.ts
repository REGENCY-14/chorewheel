import { describe, expect, it } from "vitest";
import { pickAssignments, resetPoolsForRoster } from "./pickAssignments";

const m = (id: string) => ({ id });
const c = (id: string) => ({ id });

describe("pickAssignments", () => {
  it("assigns every chore to the single member when there is only one", () => {
    const members = [m("m1")];
    const chores = [c("c1"), c("c2"), c("c3")];
    const pools = resetPoolsForRoster(chores, members);

    const { assignments } = pickAssignments(members, chores, pools);

    expect(assignments).toHaveLength(3);
    expect(assignments.every((a) => a.memberId === "m1")).toBe(true);
  });

  it("distributes fairly when there are more chores than members", () => {
    const members = [m("m1"), m("m2")];
    const chores = [c("c1"), c("c2"), c("c3"), c("c4")];
    const pools = resetPoolsForRoster(chores, members);

    const { assignments } = pickAssignments(members, chores, pools);

    expect(assignments).toHaveLength(4);
    const counts: Record<string, number> = { m1: 0, m2: 0 };
    for (const a of assignments) counts[a.memberId] += 1;
    // Fairness: nobody should be assigned 3 while the other has 1 out of 4 chores.
    expect(Math.abs(counts.m1 - counts.m2)).toBeLessThanOrEqual(1);
  });

  it("leaves some members unassigned when there are more members than chores", () => {
    const members = [m("m1"), m("m2"), m("m3"), m("m4")];
    const chores = [c("c1")];
    const pools = resetPoolsForRoster(chores, members);

    const { assignments } = pickAssignments(members, chores, pools);

    expect(assignments).toHaveLength(1);
    expect(members.map((mm) => mm.id)).toContain(assignments[0].memberId);
  });

  it("does not repeat the same member back-to-back on a chore when others are eligible", () => {
    const members = [m("m1"), m("m2"), m("m3")];
    const chores = [c("c1")];
    // Pool for c1 is exhausted (everyone already had a turn this round).
    const pools = { c1: [] };
    const lastAssigned = { c1: "m1" };

    const { assignments } = pickAssignments(members, chores, pools, lastAssigned);

    expect(assignments[0].memberId).not.toBe("m1");
  });

  it("refills an exhausted pool including the last-assignee when there is only one member", () => {
    const members = [m("m1")];
    const chores = [c("c1")];
    const pools = { c1: [] };
    const lastAssigned = { c1: "m1" };

    const { assignments } = pickAssignments(members, chores, pools, lastAssigned);

    expect(assignments[0].memberId).toBe("m1");
  });

  it("resets every chore's pool to the full member list on roster change", () => {
    const chores = [c("c1"), c("c2")];
    const newMembers = [m("m1"), m("m3")];
    const resetPools = resetPoolsForRoster(chores, newMembers);

    expect(resetPools.c1.sort()).toEqual(["m1", "m3"]);
    expect(resetPools.c2.sort()).toEqual(["m1", "m3"]);

    const { assignments } = pickAssignments(newMembers, chores, resetPools);
    for (const a of assignments) {
      expect(["m1", "m3"]).toContain(a.memberId);
    }
  });

  it("is deterministic given a fixed random source", () => {
    const members = [m("m1"), m("m2"), m("m3")];
    const chores = [c("c1"), c("c2")];
    const pools = resetPoolsForRoster(chores, members);

    const sequence = [0.1, 0.9, 0.5, 0.2, 0.7];
    let i = 0;
    const random = () => sequence[i++ % sequence.length];

    const run1 = pickAssignments(members, chores, pools, {}, random);
    i = 0;
    const run2 = pickAssignments(members, chores, pools, {}, random);

    expect(run1.assignments).toEqual(run2.assignments);
  });
});
