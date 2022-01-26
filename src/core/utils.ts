export const sequence = (size: number) =>
  Array.from({ length: size })
    .map((_, i) => i);

export const withIndex = <T>(items: T[]) =>
  items.map((item, i) => [item, i] as [T, number]);
