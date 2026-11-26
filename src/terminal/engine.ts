// Pure command-registry logic. No DOM here, so it can be tested with plain node.
// Input is untrusted text: it is only ever tokenized and matched against registered names.

export interface Arg {
  value: string;
  desc?: string;
  /** Picking this inserts it and waits for more input instead of running. */
  more?: boolean;
}

export interface Command<Ctx> {
  name: string;
  desc: string;
  aliases?: string[];
  usage?: string;
  /** Long-form documentation for `man`. */
  man?: string;
  /** Shown in the empty-input suggestion list and the command palette. */
  primary?: boolean;
  /** Completions for the next argument, given the arguments already typed. */
  args?: (typed: string[]) => Arg[];
  run: (args: string[], ctx: Ctx) => void;
}

export interface Suggestion {
  /** Full command line inserted/executed when picked. */
  value: string;
  desc: string;
  more?: boolean;
}

export type Resolution<Ctx> =
  | { kind: 'ok'; cmd: Command<Ctx>; args: string[] }
  | { kind: 'empty' }
  | { kind: 'ambiguous'; name: string; options: string[] }
  | { kind: 'unknown'; name: string; suggestion?: string };

export function tokenize(input: string): string[] {
  const out: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

export function distance(a: string, b: string): number {
  // Optimal string alignment (Levenshtein + adjacent transposition).
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  return d[a.length][b.length];
}

export class Registry<Ctx> {
  readonly commands: Command<Ctx>[];
  private byName = new Map<string, Command<Ctx>>();

  constructor(commands: Command<Ctx>[]) {
    this.commands = commands;
    for (const c of commands) for (const n of [c.name, ...(c.aliases ?? [])]) this.byName.set(n.toLowerCase(), c);
  }

  get(name: string) {
    return this.byName.get(name.toLowerCase());
  }

  get primary() {
    return this.commands.filter((c) => c.primary);
  }

  /** Closest command name for a typo, if close enough to be a useful hint. */
  nearest(name: string): string | undefined {
    const n = name.toLowerCase();
    let best: string | undefined;
    let bestD = Infinity;
    for (const key of this.byName.keys()) {
      const d = distance(n, key);
      if (d < bestD) [best, bestD] = [this.byName.get(key)!.name, d];
    }
    return bestD <= Math.max(1, Math.floor(n.length / 3)) ? best : undefined;
  }

  resolve(input: string): Resolution<Ctx> {
    const [name, ...args] = tokenize(input);
    if (!name) return { kind: 'empty' };
    const exact = this.get(name);
    if (exact) return { kind: 'ok', cmd: exact, args };
    // Unique prefix: "exper" -> experience
    const n = name.toLowerCase();
    const hits = [...new Set(this.commands.filter((c) => [c.name, ...(c.aliases ?? [])].some((k) => k.startsWith(n))).map((c) => c.name))];
    if (hits.length === 1) return { kind: 'ok', cmd: this.get(hits[0])!, args };
    if (hits.length > 1) return { kind: 'ambiguous', name, options: hits };
    return { kind: 'unknown', name, suggestion: this.nearest(name) };
  }

  complete(input: string): Suggestion[] {
    const tokens = tokenize(input);
    const trailing = /\s$/.test(input);
    if (tokens.length === 0) return this.primary.map((c) => ({ value: c.name, desc: c.desc }));

    if (tokens.length === 1 && !trailing) {
      const n = tokens[0].toLowerCase();
      const match = (k: string) => k.startsWith(n);
      let cmds = this.commands.filter((c) => match(c.name) || (c.aliases ?? []).some(match));
      if (!cmds.length) cmds = this.commands.filter((c) => c.name.includes(n));
      const out = cmds.map((c) => ({ value: c.name, desc: c.desc }));
      // Typed a full command that takes arguments: also offer its arguments.
      const exact = this.get(n);
      if (exact?.args && cmds.length === 1) out.push(...this.argSuggestions(exact, [], ''));
      return out;
    }

    const cmd = this.get(tokens[0]);
    if (!cmd?.args) return [];
    const typed = tokens.slice(1);
    const partial = trailing ? '' : (typed.pop() ?? '');
    return this.argSuggestions(cmd, typed, partial);
  }

  private argSuggestions(cmd: Command<Ctx>, typed: string[], partial: string): Suggestion[] {
    const p = partial.toLowerCase();
    const opts = cmd.args!(typed);
    const starts = opts.filter((a) => a.value.toLowerCase().startsWith(p));
    const list = starts.length || !p ? starts : opts.filter((a) => a.value.toLowerCase().includes(p));
    return list.map((a) => ({ value: [cmd.name, ...typed, a.value].join(' '), desc: a.desc ?? '', more: a.more }));
  }
}
