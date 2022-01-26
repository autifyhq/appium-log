export type Identify = <T>(item: T) => string;

export type DupGroup = {
  /** index of the first item of a group */
  startIndex: number;
  /** number of items in a group */
  size: number;
  /** how many times the duplication is repeated */
  count: number;
};

export type DupMarker = {
  /** true if item is duplicated and can be removed */
  duplicated?: true;
  /** specified if item belongs to a group */
  groupIndex?: number;
  /** true if item is the first item of a group */
  isFirst?: true;
};

export type GroupDupsResult = {
  groups: DupGroup[];
  dupMarkers: DupMarker[];
};

const equals = <T>(l: T, r: T, identify: Identify): boolean => {
  return identify(l) === identify(r);
};

const getEndIndex = ({ startIndex, size, count }: DupGroup) => {
  return startIndex + size * count - 1;
};

const sequence = (size: number) =>
  Array.from({ length: size })
    .map((_, i) => i);

const withIndex = <T>(items: T[]) =>
  items.map((item, i) => [item, i] as [T, number]);

/**
 * group duplicated items
 */
export const groupDups = <T>(
  items: T[],
  identify: Identify,
  maxGroupSize: number,
): GroupDupsResult => {
  let groups: DupGroup[] = [];

  const map = new Map<string, { item: T; index: number }>();
  let groupStarted = false;
  let indexInGroup = 0;

  for (const [item, index] of withIndex(items)) {
    const identifier = identify(item);
    if (groupStarted) {
      // group is started
      const lastGroup = groups.at(-1)!;
      const ok = equals(
        item,
        items[lastGroup.startIndex + indexInGroup],
        identify,
      );
      if (!ok) {
        // failed to create a group
        groupStarted = false;
        indexInGroup = 0;
      }
    }

    if (!groupStarted && map.has(identifier)) {
      const { index: prevIndex } = map.get(identifier)!;
      const lastGroup = groups.at(-1);
      if (!lastGroup || getEndIndex(lastGroup) < prevIndex) {
        groupStarted = true;
        indexInGroup = 0;
        groups.push({
          startIndex: prevIndex,
          size: index - prevIndex,
          count: 1,
        });
      }
    }

    if (groupStarted) {
      const lastGroup = groups.at(-1)!;

      const groupEnded = index === (getEndIndex(lastGroup) + lastGroup.size);
      if (groupEnded) {
        lastGroup.count++;
      }
      indexInGroup++; // next index
    }

    // remove old item if needed and set new item
    if (map.size > maxGroupSize) {
      const oldestKey = map.keys().next().value as string;
      const done = map.delete(oldestKey);
      if (!done) {
        throw new Error(`Value by key "${oldestKey}" does not exist`);
      }
    }
    map.set(identify(item), { item, index });
  }

  groups = groups.filter((group) => group.count > 1);

  const dupMarkers: DupMarker[] = Array.from({ length: items.length })
    .map((_, i) => ({}));
  for (const [{ startIndex, size, count }, index] of withIndex(groups)) {
    dupMarkers[startIndex].isFirst = true;
    for (const i of sequence(size)) {
      dupMarkers[startIndex + i].groupIndex = index;
    }
    for (const i of sequence(count)) {
      if (i === 0) {
        continue;
      }
      for (const j of sequence(size)) {
        dupMarkers[startIndex + i * size + j].duplicated = true;
      }
    }
  }

  return {
    groups,
    dupMarkers,
  };
};
