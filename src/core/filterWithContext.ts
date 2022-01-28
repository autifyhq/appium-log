export const filterWithContext = <T>(
  items: T[],
  predicate: (item: T) => boolean,
  context: number,
): T[] => {
  // negative number does not make sense
  context = context > 0 ? context : 0;

  const matchedFlags = items.map(predicate);
  const filterer = Array.from({ length: items.length }).fill(false);

  for (let i = 0; i < items.length; i++) {
    if (matchedFlags[i]) {
      filterer[i] = true;
      for (let l = i - 1; l >= 0 && l >= i - context && !filterer[l]; l--) {
        filterer[l] = true;
      }
      for (let r = i + 1; r <= items.length && r <= i + context; r++) {
        filterer[r] = true;
      }
    }
  }

  return items.filter((_, i) => filterer[i]);
};
