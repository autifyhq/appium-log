import { assertEquals } from "../testing.ts";
import {
  _isHttpRequestFinishing,
  _isHttpRequestStarting,
  _parseToRawEntry,
  AppiumLogRawEntry,
} from "./parseAppiumLog.ts";

Deno.test("_parseToEntry()", () => {
  const rawLog = `
2021-12-21 04:19:10:679 [Appium] Welcome to Appium v1.21.0
`.trim();

  const log = _parseToRawEntry(rawLog);
  const expected: AppiumLogRawEntry = {
    date: new Date("2021-12-21T04:19:10.679Z"),
    body: "Welcome to Appium v1.21.0",
    category: "Appium",
  };
  assertEquals(log[0], expected);
});

Deno.test("_isHttpRequestStarting()", () => {
  assertEquals(
    _isHttpRequestStarting({
      date: new Date(),
      body: "--> GET /wd/hub/session/xxx/screenshot",
      category: "HTTP",
    }),
    true,
  );
});

Deno.test("_isHttpRequestFinishing()", () => {
  assertEquals(
    _isHttpRequestFinishing({
      date: new Date(),
      body: "<-- GET /wd/hub/session/xxx/screenshot",
      category: "HTTP",
    }),
    true,
  );
});
