import { assertEquals } from "../testing.ts";
import { _parseToEntry, AppiumLogRawEntry } from "./parseAppiumLog.ts";

Deno.test("_parseToEntry: #1", () => {
  const rawLog = `
2021-12-21 04:19:10:679 [Appium] Welcome to Appium v1.21.0
`.trim();

  const log = _parseToEntry(rawLog);
  const expected: AppiumLogRawEntry = {
    date: new Date("2021-12-21T04:19:10.679Z"),
    body: "Welcome to Appium v1.21.0",
    category: "Appium",
  };
  assertEquals(log[0], expected);
});
