# group-generator

Paste a list of names and split them into random, evenly-sized groups. Choose the
number of groups or the people per group. Fisher-Yates shuffle with
`crypto.getRandomValues`, round-robin deal so groups differ by at most one.
Names saved in localStorage; "Copy a link to this list" packs the roster (not the
split) into the URL.

**Live:** https://group-generator.correia95.workers.dev/

## Stack

- React 18 + TypeScript + Vite, no runtime deps beyond React
- Static-assets Cloudflare Worker

## Engine

[`src/groups.ts`](src/groups.ts): `parseNames` (split on newline/comma),
`shuffle` (crypto Fisher-Yates, rejection sampled), `makeGroups(names, mode,
value)` (`count` clamps 1..n, `size` → `ceil(n/size)` groups), round-robin deal;
`asText`, `encodeNames`/`decodeNames`.

Verified in Node: 10 names / 3 groups -> [4,3,3]; size 3 -> [3,3,2,2]; count 20
clamps to 10; every name appears exactly once; shuffle spread even; roundtrip.

## Develop / deploy

```bash
npm install
npm run dev
npm run deploy
```
