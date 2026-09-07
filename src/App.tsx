import { useEffect, useMemo, useState } from 'react';
import { Mode, asText, decodeNames, encodeNames, groupLabel, makeGroups, parseNames } from './groups';

const LS = 'group-generator:names';

function initialText(): string {
  try {
    const p = new URLSearchParams(window.location.search).get('n');
    if (p) {
      const d = decodeNames(p);
      if (d) return d;
    }
  } catch {
    /* ignore */
  }
  try {
    const saved = localStorage.getItem(LS);
    if (saved != null) return saved;
  } catch {
    /* ignore */
  }
  return 'Alex\nBailey\nCharlie\nDrew\nEli\nFrankie\nGabby\nHarper\nImani\nJesse\nKai\nLee';
}

export default function App() {
  const [text, setText] = useState(initialText);
  const [mode, setMode] = useState<Mode>('count');
  const [value, setValue] = useState('4');
  const [groups, setGroups] = useState<string[][]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [seed, setSeed] = useState(0);

  const names = useMemo(() => parseNames(text), [text]);

  useEffect(() => {
    try {
      localStorage.setItem(LS, text);
    } catch {
      /* ignore */
    }
  }, [text]);

  // (re)generate whenever inputs or the shuffle button change
  useEffect(() => {
    setGroups(names.length ? makeGroups(names, mode, Number(value)) : []);
  }, [names, mode, value, seed]);

  const copy = async (val: string, key: string) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      /* ignore */
    }
  };

  const shareLink = async () => {
    try {
      const u = new URL(window.location.href);
      u.search = '';
      u.searchParams.set('n', encodeNames(text));
      if (u.toString().length > 8000) return;
      await navigator.clipboard.writeText(u.toString());
      setCopied('link');
      setTimeout(() => setCopied(null), 1400);
    } catch {
      /* ignore */
    }
  };

  const sizes = groups.map((g) => g.length);
  const minMax = groups.length ? `${Math.min(...sizes)}–${Math.max(...sizes)}` : '';

  return (
    <div className="app">
      <header>
        <h1>Random Group Generator</h1>
        <p className="tag">
          Paste a list of names and split them into random, evenly-sized groups — for teams,
          breakout rooms, project pairs or a class activity. Shuffled with your device's secure
          random generator.
        </p>
      </header>

      <textarea
        className="names"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        placeholder="One name per line (or comma-separated)…"
        aria-label="Names"
      />
      <p className="count">{names.length} name{names.length === 1 ? '' : 's'}</p>

      <div className="controls">
        <div className="seg">
          <button className={mode === 'count' ? 'on' : ''} onClick={() => setMode('count')}>Number of groups</button>
          <button className={mode === 'size' ? 'on' : ''} onClick={() => setMode('size')}>People per group</button>
        </div>
        <input
          className="val"
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
          aria-label={mode === 'count' ? 'Number of groups' : 'People per group'}
        />
        <button className="go" onClick={() => setSeed((s) => s + 1)} disabled={names.length < 2}>Shuffle</button>
      </div>

      {groups.length > 0 && (
        <>
          <div className="meta">
            {groups.length} groups · {minMax} per group
            <button onClick={() => copy(asText(groups), 'all')}>{copied === 'all' ? 'Copied' : 'Copy all'}</button>
          </div>
          <div className="groups">
            {groups.map((g, i) => (
              <div key={i} className="group">
                <div className="ghead">
                  <span>{groupLabel(i)}</span>
                  <i>{g.length}</i>
                </div>
                <ul>
                  {g.map((n) => <li key={n}>{n}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}

      <button className="link" onClick={shareLink}>{copied === 'link' ? 'Link copied' : 'Copy a link to this list'}</button>

      <section className="explainer">
        <h2>How it works</h2>
        <p>
          Names are shuffled with a Fisher–Yates shuffle driven by
          <code> crypto.getRandomValues</code> — the same random source used for cryptographic keys,
          so every arrangement is equally likely with no bias. Then they're dealt out one at a time,
          round-robin, so the groups always come out within one person of each other in size.
        </p>
        <h3>Groups vs group size</h3>
        <p>
          Switch between "number of groups" (I want 4 teams) and "people per group" (put them in
          pairs, or fours). With people-per-group, the last group takes whoever is left over rather
          than leaving anyone out.
        </p>
        <h3>Getting a different split</h3>
        <p>
          Press <strong>Shuffle</strong> for a fresh random arrangement. Changing the names or the
          number also re-rolls. The result isn't saved — only the list of names is, in this browser,
          and "Copy a link to this list" packs the names (not the split) into a URL so you can send
          the roster to someone.
        </p>
        <h3>Is anything sent to a server?</h3>
        <p>No. It all runs in your browser.</p>
        <footer>Random Group Generator · no sign-up · works offline once loaded</footer>
      </section>
    </div>
  );
}
