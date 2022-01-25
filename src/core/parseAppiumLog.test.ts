import { assertEquals } from "../testing.ts";
import {
  _isHttpRequestEnding,
  _isHttpRequestStarting,
  _parseRequestEnd,
  _parseRequestStart,
  _parseToRawEntry,
  AppiumLog,
  AppiumLogRawEntry,
  parseAppiumLog,
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

Deno.test("parseAppiumLog()", () => {
  const expected: AppiumLog = {
    entries: [
      {
        timestamp: { date: new Date("2021-12-21T04:30:54.845Z"), seconds: 0 },
        category: "HTTP",
        body: "--> GET /wd/hub/session/xxx/screenshot",
        http: {
          requestId:
            "2021-12-21T04:30:54.845Z GET /wd/hub/session/xxx/screenshot",
          starting: true,
        },
      },
      {
        timestamp: {
          date: new Date("2021-12-21T04:30:54.857Z"),
          seconds: 0.012,
        },
        category: "W3C (aaaa)",
        body: 'Calling AppiumDriver.getScreenshot() with args: ["xxx"]',
      },
      {
        timestamp: {
          date: new Date("2021-12-21T04:30:54.858Z"),
          seconds: 0.013,
        },
        category: "XCUITest",
        body: "Executing command 'getScreenshot'",
      },
      {
        timestamp: {
          date: new Date("2021-12-21T04:30:54.859Z"),
          seconds: 0.014,
        },
        category: "XCUITest",
        body: "Taking screenshot with WDA",
      },
      {
        timestamp: {
          date: new Date("2021-12-21T04:30:54.860Z"),
          seconds: 0.015,
        },
        category: "WD Proxy",
        body: "Matched '/screenshot' to command name 'getScreenshot'",
      },
      {
        timestamp: {
          date: new Date("2021-12-21T04:30:54.860Z"),
          seconds: 0.015,
        },
        category: "WD Proxy",
        body:
          "Proxying [GET /screenshot] to [GET http://127.0.0.1:8100/session/111/screenshot] with no body",
      },
      {
        timestamp: {
          date: new Date("2021-12-21T04:30:55.088Z"),
          seconds: 0.243,
        },
        category: "WD Proxy",
        body:
          'Got response with status 200: {"value":"iVBORw0KGgoAAAANSUhEUgAABJIAAAnkCAYAAABWQUsDAAAA...',
      },
      {
        timestamp: {
          date: new Date("2021-12-21T04:30:55.091Z"),
          seconds: 0.246,
        },
        category: "W3C (aaaa)",
        body:
          'Responding to client with driver.getScreenshot() result: "iVBORw0KGgoAAAANSUhEUgAABJIAAAnkCAYAAABWQUsDAAAA...',
      },
      {
        timestamp: {
          date: new Date("2021-12-21T04:30:55.093Z"),
          seconds: 0.248,
        },
        category: "HTTP",
        body: "<-- GET /wd/hub/session/xxx/screenshot 200 248 ms - 134348",
        http: {
          requestId:
            "2021-12-21T04:30:54.845Z GET /wd/hub/session/xxx/screenshot",
          finishing: true,
        },
      },
      {
        timestamp: {
          date: new Date("2021-12-21T04:30:55.162Z"),
          seconds: 0.317,
        },
        category: "HTTP",
        body: "--> POST /wd/hub/session/xxx/execute/sync",
        http: {
          requestId:
            "2021-12-21T04:30:55.162Z POST /wd/hub/session/xxx/execute/sync",
          starting: true,
        },
      },
      {
        timestamp: {
          date: new Date("2021-12-21T04:30:55.173Z"),
          seconds: 0.328,
        },
        category: "W3C (aaaa)",
        body:
          'Calling AppiumDriver.execute() with args: ["mobile:source",[{"format":"xml","excludedAttributes":["visible"]}],"xxx"]',
      },
      {
        timestamp: {
          date: new Date("2021-12-21T04:30:55.173Z"),
          seconds: 0.328,
        },
        category: "XCUITest",
        body: "Executing command 'execute'",
      },
      {
        timestamp: {
          date: new Date("2021-12-21T04:30:55.175Z"),
          seconds: 0.33,
        },
        category: "WD Proxy",
        body:
          "Matched '/source?format=xml&excluded_attributes=visible' to command name 'getPageSource'",
      },
      {
        timestamp: {
          date: new Date("2021-12-21T04:30:55.177Z"),
          seconds: 0.332,
        },
        category: "WD Proxy",
        body:
          "Proxying [GET /source?format=xml&excluded_attributes=visible] to [GET http://127.0.0.1:8100/session/111/source?format=xml&excluded_attributes=visible] with no body",
      },
      {
        timestamp: {
          date: new Date("2021-12-21T04:30:57.442Z"),
          seconds: 2.597,
        },
        category: "WD Proxy",
        body:
          'Got response with status 200: {"value":"<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>\\n<XCUIElementTypeApplication type=\\"XCUIElementTypeApplication\\"...',
      },
      {
        timestamp: {
          date: new Date("2021-12-21T04:30:57.443Z"),
          seconds: 2.598,
        },
        category: "W3C (aaaa)",
        body:
          'Responding to client with driver.execute() result: "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>\\n<XCUIElementTypeApplication type=\\"XCUIElementTypeApplication\\"...',
      },
      {
        timestamp: {
          date: new Date("2021-12-21T04:30:57.444Z"),
          seconds: 2.599,
        },
        category: "HTTP",
        body: "<-- POST /wd/hub/session/xxx/execute/sync 200 2282 ms - 9776",
        http: {
          requestId:
            "2021-12-21T04:30:55.162Z POST /wd/hub/session/xxx/execute/sync",
          finishing: true,
        },
      },
    ],
    httpRequests: new Map([
      ["2021-12-21T04:30:54.845Z GET /wd/hub/session/xxx/screenshot", {
        id: "2021-12-21T04:30:54.845Z GET /wd/hub/session/xxx/screenshot",
        method: "GET",
        path: "/wd/hub/session/xxx/screenshot",
        shortPath: "/screenshot",
        request: { body: "{}" },
        response: { status: 200, millisecond: 248 },
      }],
      ["2021-12-21T04:30:55.162Z POST /wd/hub/session/xxx/execute/sync", {
        id: "2021-12-21T04:30:55.162Z POST /wd/hub/session/xxx/execute/sync",
        method: "POST",
        path: "/wd/hub/session/xxx/execute/sync",
        shortPath: "/execute/sync",
        request: {
          body:
            '{"script":"mobile:source","args":[{"format":"xml","excludedAttributes":["visible"]}]}',
        },
        response: { status: 200, millisecond: 2282 },
      }],
    ]),
    dupGroups: new Map(),
  };
  const logText = `
2021-12-21 04:30:54:845 [HTTP] --> GET /wd/hub/session/xxx/screenshot
2021-12-21 04:30:54:846 [HTTP] {}
2021-12-21 04:30:54:857 [W3C (aaaa)] Calling AppiumDriver.getScreenshot() with args: ["xxx"]
2021-12-21 04:30:54:858 [XCUITest] Executing command 'getScreenshot'
2021-12-21 04:30:54:859 [XCUITest] Taking screenshot with WDA
2021-12-21 04:30:54:860 [WD Proxy] Matched '/screenshot' to command name 'getScreenshot'
2021-12-21 04:30:54:860 [WD Proxy] Proxying [GET /screenshot] to [GET http://127.0.0.1:8100/session/111/screenshot] with no body
2021-12-21 04:30:55:088 [WD Proxy] Got response with status 200: {"value":"iVBORw0KGgoAAAANSUhEUgAABJIAAAnkCAYAAABWQUsDAAAA...
2021-12-21 04:30:55:091 [W3C (aaaa)] Responding to client with driver.getScreenshot() result: "iVBORw0KGgoAAAANSUhEUgAABJIAAAnkCAYAAABWQUsDAAAA...
2021-12-21 04:30:55:093 [HTTP] <-- GET /wd/hub/session/xxx/screenshot 200 248 ms - 134348
2021-12-21 04:30:55:093 [HTTP] 
2021-12-21 04:30:55:162 [HTTP] --> POST /wd/hub/session/xxx/execute/sync
2021-12-21 04:30:55:162 [HTTP] {"script":"mobile:source","args":[{"format":"xml","excludedAttributes":["visible"]}]}
2021-12-21 04:30:55:173 [W3C (aaaa)] Calling AppiumDriver.execute() with args: ["mobile:source",[{"format":"xml","excludedAttributes":["visible"]}],"xxx"]
2021-12-21 04:30:55:173 [XCUITest] Executing command 'execute'
2021-12-21 04:30:55:175 [WD Proxy] Matched '/source?format=xml&excluded_attributes=visible' to command name 'getPageSource'
2021-12-21 04:30:55:177 [WD Proxy] Proxying [GET /source?format=xml&excluded_attributes=visible] to [GET http://127.0.0.1:8100/session/111/source?format=xml&excluded_attributes=visible] with no body
2021-12-21 04:30:57:442 [WD Proxy] Got response with status 200: {"value":"<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>\\n<XCUIElementTypeApplication type=\\"XCUIElementTypeApplication\\"...
2021-12-21 04:30:57:443 [W3C (aaaa)] Responding to client with driver.execute() result: "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>\\n<XCUIElementTypeApplication type=\\"XCUIElementTypeApplication\\"...
2021-12-21 04:30:57:444 [HTTP] <-- POST /wd/hub/session/xxx/execute/sync 200 2282 ms - 9776
`.trim();
  assertEquals(
    parseAppiumLog(logText),
    expected,
  );
});
