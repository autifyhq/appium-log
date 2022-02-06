import { AppiumLogHttpRequest } from "./parseAppiumLog.ts";

type Condition = {
  method: string;
  path: string;
  requestAt: number;
};

export const findClosestRequest = (
  requests: AppiumLogHttpRequest[],
  condition: Condition,
): AppiumLogHttpRequest | null => {
  const candidates = requests.filter(({ method, path }) =>
    method === condition.method && path === condition.path
  );
  if (candidates.length === 0) {
    return null;
  }
  if (candidates.length === 1) {
    return candidates[0];
  }

  console.warn(`${candidates.length} concurrent requests detected.`, condition);

  // because requests.length is at most 2 or 3, we don't need a fast algorithm to find a closest request
  // just use a naive one
  const timestamps = candidates.map((request) => request.requestAt);
  const diffs = timestamps.map((timestamp) =>
    Math.abs(timestamp - condition.requestAt)
  );

  let minIndex = 0;
  let minDiff = Infinity;
  for (const [index, diff] of Object.entries(diffs)) {
    if (diff < minDiff) {
      minDiff = diff;
      minIndex = Number(index);
    }
  }

  return requests[minIndex];
};
