export type Identify = <T>(item: T) => string;

export type DupGroup = {
  startIndex: number;
  size: number;
  count: number;
};

export type GroupDupsResult = {
  groups: DupGroup[];
  // duplicatedMarkers: boolean[]
};

const equals = <T>(l: T, r: T, identify: Identify): boolean => {
  return identify(l) === identify(r);
};

const getEndIndex = ({ startIndex, size, count }: DupGroup) => {
  return startIndex + size * count - 1;
};

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

  items.forEach((item, index) => {
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
  });

  groups = groups.filter((group) => group.count > 1);

  return {
    groups,
  };
};
