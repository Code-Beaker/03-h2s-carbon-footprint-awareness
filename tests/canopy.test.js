import { getCanopyHealthState } from "../src/canopy.js";

describe("Digital Canopy Tree State Classification", () => {
  test("should classify low footprint (<100) as Flourishing Canopy and set blossoms based on active pledges", () => {
    // low pledges
    const state1 = getCanopyHealthState(85, 2);
    expect(state1.statusText).toBe("Flourishing Canopy");
    expect(state1.depth).toBe(6);
    expect(state1.leafCount).toBe(5);
    expect(state1.leafColor).toBe("#52B788");
    expect(state1.leafScale).toBe(1.2);
    expect(state1.badgeColor).toBe("#52B788");
    expect(state1.showBlossoms).toBe(false);

    // high pledges (>=4)
    const state2 = getCanopyHealthState(85, 4);
    expect(state2.showBlossoms).toBe(true);
  });

  test("should classify medium footprint (100 to 199) as Growing Sapling", () => {
    // low pledges
    const state1 = getCanopyHealthState(150, 3);
    expect(state1.statusText).toBe("Growing Sapling");
    expect(state1.depth).toBe(5);
    expect(state1.leafCount).toBe(4);
    expect(state1.leafColor).toBe("#74C69D");
    expect(state1.leafScale).toBe(1.0);
    expect(state1.badgeColor).toBe("#74C69D");
    expect(state1.showBlossoms).toBe(false);

    // high pledges (>=6)
    const state2 = getCanopyHealthState(150, 6);
    expect(state2.showBlossoms).toBe(true);
  });

  test("should classify higher footprint (200 to 349) as Young Seedling", () => {
    const state = getCanopyHealthState(280, 5);
    expect(state.statusText).toBe("Young Seedling");
    expect(state.depth).toBe(4);
    expect(state.leafCount).toBe(3);
    expect(state.leafColor).toBe("#8D99AE");
    expect(state.leafScale).toBe(0.9);
    expect(state.badgeColor).toBe("#F77F00");
    expect(state.showBlossoms).toBe(false);
  });

  test("should classify very high footprint (>=350) as Stressed", () => {
    const state = getCanopyHealthState(420, 9);
    expect(state.statusText).toBe("Stressed");
    expect(state.depth).toBe(4);
    expect(state.leafCount).toBe(2);
    expect(state.leafColor).toBe("#8a7043");
    expect(state.leafScale).toBe(0.8);
    expect(state.badgeColor).toBe("#E63946");
    expect(state.showBlossoms).toBe(false);
  });
});
