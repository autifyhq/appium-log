import { DateFns } from "../deps.ts";
import { groupDups } from "./groupDups.ts";
import { withIndex } from "./utils.ts";
import { findClosestRequest } from "./findClosestRequest.ts";

export type AppiumLogRawEntry = {
  date: Date;
  category: string;
  body: string;
};

export type AppiumLogTimestamp = {
  date: Date;
  seconds: number;
};

export type AppiumLogEntry = {
  timestamp: AppiumLogTimestamp;
  category: string;
  body: string;

  duplicateCount?: number;
  inDupGroup?: true;

  http?: {
    requestId: string;
    starting?: true;
    finishing?: true;
  };
};

export type AppiumLogHttpRequest = {
  id: string;
  method: string;
  path: string;
  shortPath?: string;
  requestAt: number;
  request: {
    body: string;
  };
  response?: {
    status: number;
    millisecond: number;
  };
};

export type AppiumLog = {
  entries: AppiumLogEntry[];
  httpRequests: Map<AppiumLogHttpRequest["id"], AppiumLogHttpRequest>;
};

const DUP_GROUP_MAX_LINES = 10;

// yyyy-MM-dd HH:mm:ss:SSS [Category] log body
const LOG_LINE_PATTERN = /(\d+-\d+-\d+ \d+:\d+:\d+:\d+) \[(.+?)\] (.+)/;

export const _parseToRawEntry = (log: string): AppiumLogRawEntry[] => {
  const lines = log.split("\n");
  const entries = lines.map((line) => {
    const match = LOG_LINE_PATTERN.exec(line);
    if (!match) {
      return null;
    }

    const [_, date, category, body = ""] = match;
    const entry: AppiumLogRawEntry = {
      date: DateFns.parse(
        date + " Z", // parse as UTC date
        "yyyy-MM-dd HH:mm:ss:SSS X",
        new Date(),
      ),
      category,
      body,
    };
    return entry;
  })
    .filter((entry): entry is AppiumLogRawEntry => Boolean(entry));

  return entries;
};

const HTTP_CATEGORY = "HTTP";
const HTTP_REQUEST_START_PREFIX = "--> ";
const HTTP_REQUEST_END_PREFIX = "<-- ";
// --> GET /wd/hub/session/xxx/screenshot
const HTTP_REQUEST_START_PATTERN = /^--> (\w+) (\S+)/;
// <-- GET /wd/hub/session/xxx/screenshot 200 162 ms - 170916
const HTTP_REQUEST_END_PATTERN = /^<-- (\w+) (\S+) (\d+) (\d+) ms/;

export const _isHttpRequestStarting = (entry: AppiumLogRawEntry): boolean => {
  return entry.category === HTTP_CATEGORY &&
    entry.body.startsWith(HTTP_REQUEST_START_PREFIX);
};

export const _isHttpRequestEnding = (entry: AppiumLogRawEntry): boolean => {
  return entry.category === HTTP_CATEGORY &&
    entry.body.startsWith(HTTP_REQUEST_END_PREFIX);
};

export const _parseRequestStart = (entryBody: string) => {
  const match = HTTP_REQUEST_START_PATTERN.exec(entryBody);
  if (!match) {
    throw new Error(`Not a http request starting pattern: ${entryBody}`);
  }

  const [_, method, path] = match;
  return {
    method,
    path,
  };
};

// Get "/element" from "/wd/hub/session/:session_id/element"
const SHORT_PATH_PATTERN = /session\/[^/]+(\/.+)/;
const _getShortPath = (path: string): string | undefined => {
  const matched = SHORT_PATH_PATTERN.exec(path);
  if (!matched) {
    return undefined;
  }
  const [_, shortPath] = matched;
  return shortPath;
};

export const _entryEquals = (
  entryA: AppiumLogRawEntry,
  entryB: AppiumLogRawEntry,
): boolean => {
  return entryA.category === entryB.category && entryA.body === entryB.body;
};

export const _parseRequestEnd = (entryBody: string) => {
  const match = HTTP_REQUEST_END_PATTERN.exec(entryBody);
  if (!match) {
    throw new Error(`Not a http request ending pattern: ${entryBody}`);
  }

  const [_, method, path, status, millisecond] = match;
  return {
    method,
    path,
    status: Number(status),
    millisecond: Number(millisecond),
  };
};

export const _enrichEntries = (rawEntries: AppiumLogRawEntry[]): AppiumLog => {
  let entries: AppiumLogEntry[] = [];
  const httpRequests: AppiumLog["httpRequests"] = new Map();
  if (rawEntries.length === 0) {
    return {
      entries,
      httpRequests,
    };
  }

  const startDate = rawEntries[0].date.getTime();
  // provide context for current http request
  let requestStack: AppiumLogHttpRequest[] = [];
  // to tell the previous entry is http request starting
  let isRequestStarting = false;

  for (const rawEntry of rawEntries) {
    const { date, category, body } = rawEntry;
    const timestamp: AppiumLogTimestamp = {
      date,
      seconds: (date.getTime() - startDate) / 1000,
    };
    const entry: AppiumLogEntry = {
      timestamp,
      category,
      body,
    };
    if (_isHttpRequestStarting(rawEntry)) {
      const { method, path } = _parseRequestStart(rawEntry.body);
      const request: AppiumLogHttpRequest = {
        id: `${date.toISOString()} ${method} ${path}`,
        method,
        path,
        shortPath: _getShortPath(path),
        request: {
          body: "", // will be set at the next entry
        },
        requestAt: timestamp.date.getTime(),
      };

      requestStack.push(request);
      httpRequests.set(request.id, request);
      entry.http = {
        requestId: request.id,
        starting: true,
      };
      isRequestStarting = true;
    } else if (_isHttpRequestEnding(rawEntry)) {
      if (requestStack.length === 0) {
        throw new Error("http request is finished before starting");
      }

      const { method, path, status, millisecond } = _parseRequestEnd(
        rawEntry.body,
      );

      // find the corresponding http request
      const requestAt = timestamp.date.getTime() - millisecond;
      const request = findClosestRequest(requestStack, {
        method,
        path,
        requestAt,
      });
      if (!request) {
        console.error("Could not found the starting http request log for", {
          method,
          path,
          requestAt,
        });
        continue;
      }

      requestStack = requestStack.filter(({ id }) => id !== request.id);

      request.response = {
        status,
        millisecond,
      };
      entry.http = {
        requestId: request.id,
        finishing: true,
      };
    } else if (isRequestStarting) {
      // this entry must describe the request body
      const requestId = requestStack[requestStack.length - 1].id;
      const request = httpRequests.get(requestId)!;
      request.request.body = body;
      isRequestStarting = false;
      // skip to add to entries
      continue;
    } else {
      // check log duplication
    }

    entries.push(entry);
  }

  const { groups, dupMarkers } = groupDups(
    entries,
    ({ category, body }: AppiumLogEntry) => `${category}/${body}`,
    DUP_GROUP_MAX_LINES,
  );
  for (const [{ isFirst, groupIndex }, index] of withIndex(dupMarkers)) {
    if (typeof groupIndex === "number") {
      const group = groups[groupIndex];
      const entry = entries[index];
      if (isFirst) {
        entry.duplicateCount = group.size;
      }
      entry.inDupGroup = true;
    }
  }
  entries = entries.filter((_, index) => !dupMarkers[index].duplicated);

  return {
    entries,
    httpRequests,
  };
};

export const parseAppiumLog = (log: string): AppiumLog => {
  const rawEntries = _parseToRawEntry(log);
  const appiumLog = _enrichEntries(rawEntries);
  return appiumLog;
};
