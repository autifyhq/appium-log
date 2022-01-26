import { assertEquals } from "../testing.ts";
import { groupDups, GroupDupsResult } from "./groupDups.ts";

Deno.test("groupDups#1", () => {
  const result = groupDups([], () => "1", 1);
  const expected: GroupDupsResult = {
    groups: [],
    dupMarkers: [],
  };
  assertEquals(
    result,
    expected,
  );
});

Deno.test("groupDups#2", () => {
  const result = groupDups(
    [1, 2, 3, 4, 2, 3, 4, 2, 3, 4, 2, 3, 1],
    (n) => String(n),
    5,
  );
  const expected: GroupDupsResult = {
    groups: [{
      startIndex: 1,
      size: 3,
      count: 3,
    }],
    dupMarkers: [
      {},
      { groupIndex: 0, isFirst: true },
      { groupIndex: 0 },
      { groupIndex: 0 },
      { duplicated: true },
      { duplicated: true },
      { duplicated: true },
      { duplicated: true },
      { duplicated: true },
      { duplicated: true },
      {},
      {},
      {},
    ],
  };
  assertEquals(
    result,
    expected,
  );
});

Deno.test("groupDups#3", () => {
  const result = groupDups(
    [1, 1, 1, 2, 2, 2, 2, 3, 2, 3, 2, 3, 2],
    (n) => String(n),
    3,
  );
  const expected: GroupDupsResult = {
    groups: [{
      startIndex: 0,
      size: 1,
      count: 3,
    }, {
      startIndex: 3,
      size: 1,
      count: 4,
    }, {
      startIndex: 7,
      size: 2,
      count: 3,
    }],
    dupMarkers: [
      {
        groupIndex: 0,
        isFirst: true,
      },
      {
        duplicated: true,
      },
      {
        duplicated: true,
      },
      {
        groupIndex: 1,
        isFirst: true,
      },
      {
        duplicated: true,
      },
      {
        duplicated: true,
      },
      {
        duplicated: true,
      },
      {
        groupIndex: 2,
        isFirst: true,
      },
      {
        groupIndex: 2,
      },
      {
        duplicated: true,
      },
      {
        duplicated: true,
      },
      {
        duplicated: true,
      },
      {
        duplicated: true,
      },
    ],
  };
  assertEquals(
    result,
    expected,
  );
});
