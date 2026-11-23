import { describe, expect, it } from "vitest";
import { searchItems, type SearchItem } from "./search";

const item = (name: string, hint = "", aliases: string[] = []): SearchItem => ({ slug: name.toLowerCase(), name, hint, aliases });

describe("searchItems", () => {
  const index = [
    ...Array.from({ length: 20 }, (_, i) => item(`Nymph ${String(i).padStart(2, "0")}`)),
    item("Athena", "goddess of wisdom", ["Pallas"]),
    item("Pallas", "a Titan"),
    item("Hippolyta", "queen of the Amazons"),
    item("Apollo", "god of light, son of Leto"),
  ];

  it("returns every match, not a capped page", () => {
    expect(searchItems(index, "nymph")).toHaveLength(20);
  });

  it("ranks exact → prefix → substring → hint", () => {
    expect(searchItems(index, "pallas").map((i) => i.name)).toEqual(["Athena", "Pallas"]);
    expect(searchItems(index, "lyt").map((i) => i.name)).toEqual(["Hippolyta"]);
    expect(searchItems(index, "leto").map((i) => i.name)).toEqual(["Apollo"]);
    expect(searchItems(index, "ath")[0].name).toBe("Athena");
  });

  it("ignores accents and case", () => {
    expect(searchItems(index, "ATHÉNA").map((i) => i.name)).toEqual(["Athena"]);
  });

  it("honours an explicit limit and empty queries", () => {
    expect(searchItems(index, "nymph", 5)).toHaveLength(5);
    expect(searchItems(index, "   ")).toEqual([]);
  });
});
