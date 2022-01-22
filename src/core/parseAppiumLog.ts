import { DateFns, uuid } from "../deps.ts";

export type AppiumLogRawEntry = {
  date: Date;
  category: string;
  body: string;
};

type Timestamp = {
  date: Date;
  seconds: number;
};

export type AppiumLogEntry = {
  timestamp: Timestamp;
  category: string;
  body: string;
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

// yyyy-MM-dd HH:mm:ss:SSS [Category] log body
const LOG_LINE_PATTERN = /(\d+-\d+-\d+ \d+:\d+:\d+:\d+) \[(.+)\] (.+)/;

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
const HTTP_REQUEST_START_PATTERN = "--> ";
const HTTP_REQUEST_FINISH_PATTERN = "<-- ";

export const _isHttpRequestStarting = (entry: AppiumLogRawEntry): boolean => {
  return entry.category === HTTP_CATEGORY &&
    entry.body.startsWith(HTTP_REQUEST_START_PATTERN);
};

export const _isHttpRequestFinishing = (entry: AppiumLogRawEntry): boolean => {
  return entry.category === HTTP_CATEGORY &&
    entry.body.startsWith(HTTP_REQUEST_FINISH_PATTERN);
};

export const _enrichEntries = (rawEntries: AppiumLogRawEntry[]) => {
  const entries: AppiumLogEntry[] = [];
  const httpRequests: AppiumLog["httpRequests"] = new Map();
  if (rawEntries.length === 0) {
    return {
      entries,
      httpRequests,
    };
  }

  const startDate = rawEntries[0].date.getTime();
  let currentHttpRequestId: string | null = null;

  for (const rawEntry of rawEntries) {
    const { date, category, body } = rawEntry;
    const timestamp: Timestamp = {
      date,
      seconds: (startDate - date.getTime()) / 1000,
    };
    const entry: AppiumLogEntry = {
      timestamp,
      category,
      body,
    };
    if (_isHttpRequestStarting(rawEntry)) {
      const request: AppiumLogHttpRequest = {
        id: uuid(),
        // TODO
        method: "GET",
        path: "/",
        request: {
          body: "",
        },
      };

      currentHttpRequestId = request.id;
      httpRequests.set(request.id, request);
      entry.http = {
        requestId: currentHttpRequestId,
        starting: true,
      };
    } else if (_isHttpRequestFinishing(rawEntry)) {
      if (!currentHttpRequestId) {
        throw new Error("http request is finished before starting");
      }

      const request = httpRequests.get(currentHttpRequestId);
      if (!request) {
        throw new Error(`http request not found: ${currentHttpRequestId}`);
      }

      request.response = {
        // TODO
        status: 200,
        millisecond: 0,
      };
      entry.http = {
        requestId: currentHttpRequestId,
        finishing: true,
      };
    } else if (currentHttpRequestId) {
      entry.http = {
        requestId: currentHttpRequestId,
      };
    }
  }

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
