import { assertEquals } from "../testing.ts";
import {
  _isHttpRequestEnding,
  _isHttpRequestStarting,
  _parseRequestEnd,
  _parseRequestStart,
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

Deno.test("_isHttpRequestEnding()", () => {
  assertEquals(
    _isHttpRequestEnding({
      date: new Date(),
      body: "<-- GET /wd/hub/session/xxx/screenshot",
      category: "HTTP",
    }),
    true,
  );
});

Deno.test("_parseRequestStart()", () => {
  assertEquals(
    _parseRequestStart("--> GET /wd/hub/session/xxx/screenshot"),
    {
      method: "GET",
      path: "/wd/hub/session/xxx/screenshot",
    },
  );
});

Deno.test("_parseRequestEnd()", () => {
  assertEquals(
    _parseRequestEnd(
      "<-- GET /wd/hub/session/xxx/screenshot 200 228 ms - 238976",
    ),
    {
      method: "GET",
      path: "/wd/hub/session/xxx/screenshot",
      status: 200,
      millisecond: 228,
    },
  );
});
