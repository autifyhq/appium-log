import { assertEquals } from "../testing.ts";
import { filterWithContext } from "./filterWithContext.ts";

Deno.test("filterWithContext#1", () => {
  const result = filterWithContext(
    [0, 1, 0, 0, 0, 0, 0, 2, 0, 3, 4, 0, 0, 0],
    (n) => n > 0,
    2,
  );
  const expected = [0, 1, 0, 0, 0, 0, 2, 0, 3, 4, 0, 0];
  assertEquals(result, expected);
});

Deno.test("filterWithContext#2", () => {
  const result = filterWithContext(
    [0, 1, 0, 0, 0, 0, 0, 2, 0, 3, 4, 0, 0, 0],
    (n) => n > 0,
    0,
  );
  const expected = [1, 2, 3, 4];
  assertEquals(result, expected);
});
