type Timestamp = {
  /** absolute date */
  date: Date;
  /** duration from start */
  second: number;
};

export type AppiumLogEntry = {
  timestamp: Timestamp;
  category: string;
  body: string;
};
export type AppiumLog = AppiumLogEntry[];

// 2021-12-21 04:31:37:771 [HTTP] --> GET /wd/hub/session/fcd57e39-8cf5-48cf-9ad1-88d8bef39dcb/element/8D000000-0000-0000-BC07-000000000000/rect

const pattern = /(\d+-\d+-\d+ \d+:\d+:\d+:\d+) \[(.+)\] (.+)/;

export const parseAppiumLog = (log: string): AppiumLog => {
  const lines = log.split("\n");
  const entries = lines.map((line) => {
    const match = pattern.exec(line);
    if (!match) {
      return null;
    }

    const [date, category, body = ""] = match;
    return {
      date,
      category,
      body,
    };
  }).map((entry, _, entries) => {
    if (!entry) {
      return null;
    }

    const { date, category, body } = entry;
    const first = entries[0]!;
    const timestamp: Timestamp = {
      date: new Date(date),
      second: (new Date(date).getTime() - new Date(first.date).getTime()) /
        1000,
    };
    return {
      timestamp,
      category,
      body,
    };
  })
    .filter((entry): entry is AppiumLogEntry => Boolean(entry));

  return entries;
};
