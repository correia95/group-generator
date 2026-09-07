// Split a list of names into random groups. Crypto-shuffled.

export function parseNames(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Fisher–Yates using crypto for a fair shuffle
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  const rand = (n: number) => {
    const max = Math.floor(0xffffffff / n) * n;
    const buf = new Uint32Array(1);
    let x = 0;
    do {
      crypto.getRandomValues(buf);
      x = buf[0];
    } while (x >= max);
    return x % n;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type Mode = 'count' | 'size';

// distribute n items into `groupCount` groups as evenly as possible
export function makeGroups(names: string[], mode: Mode, value: number): string[][] {
  const shuffled = shuffle(names);
  const n = shuffled.length;
  if (n === 0) return [];

  let groupCount: number;
  if (mode === 'count') {
    groupCount = Math.max(1, Math.min(n, Math.floor(value) || 1));
  } else {
    const size = Math.max(1, Math.floor(value) || 1);
    groupCount = Math.max(1, Math.ceil(n / size));
  }

  const groups: string[][] = Array.from({ length: groupCount }, () => []);
  // round-robin deal keeps sizes within 1 of each other
  shuffled.forEach((name, i) => {
    groups[i % groupCount].push(name);
  });
  return groups;
}

export function groupLabel(i: number): string {
  return `Group ${i + 1}`;
}

export function asText(groups: string[][]): string {
  return groups
    .map((g, i) => `${groupLabel(i)}\n${g.map((n) => `  ${n}`).join('\n')}`)
    .join('\n\n');
}

// encode/decode the names for a shareable link (not the random result — that
// re-rolls, which is the point)
export function encodeNames(text: string): string {
  return btoa(unescape(encodeURIComponent(text))).replace(/\+/g, '-').replace(/\//g, '_');
}
export function decodeNames(b64: string): string {
  try {
    return decodeURIComponent(escape(atob(b64.replace(/-/g, '+').replace(/_/g, '/'))));
  } catch {
    return '';
  }
}
