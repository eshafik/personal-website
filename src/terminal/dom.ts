// Tiny DOM builders for terminal output. Strings become text nodes — never HTML —
// so user input echoed back can't inject markup.
type Child = Node | string | number | false | null | undefined | Child[];
type Attrs = Record<string, string | number | boolean | undefined | ((e: Event) => void)>;

export function h(tag: string, attrs: Attrs | null = null, ...children: Child[]): HTMLElement {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v === undefined || v === false) continue;
    if (typeof v === 'function') el.addEventListener(k.replace(/^on/, ''), v);
    else if (k === 'class') el.className = String(v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  append(el, children);
  return el;
}

function append(el: Node, children: Child[]) {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
}

/** A clickable command. Clicking runs it in the terminal (delegated handler in app.ts). */
export const cmd = (line: string, label: string = line) => h('button', { type: 'button', class: 'cmd', 'data-cmd': line }, label);

export const heading = (title: string, note?: string) =>
  h('h2', { class: 'o-head' }, h('span', null, title), note && h('span', { class: 'o-note' }, note));

export const p = (...c: Child[]) => h('p', { class: 'o-text' }, ...c);
export const muted = (...c: Child[]) => h('p', { class: 'o-text o-muted' }, ...c);

export const kv = (rows: [string, Child][]) =>
  h('dl', { class: 'o-kv' }, rows.map(([k, v]) => [h('dt', null, k), h('dd', null, v)]));

export const list = (items: Child[], cls = '') => h('ul', { class: `o-list ${cls}` }, items.map((i) => h('li', null, i)));

/** "Next actions" footer: clickable follow-up commands with a short description. */
export const next = (items: [string, string][]) =>
  h(
    'nav',
    { class: 'o-next', 'aria-label': 'Suggested next commands' },
    h('span', { class: 'o-next-label' }, 'next'),
    h('ul', null, items.map(([c, d]) => h('li', null, cmd(c), h('span', null, d)))),
  );

export const error = (...c: Child[]) => h('p', { class: 'o-text o-err', role: 'alert' }, h('span', { class: 'o-err-tag' }, 'error'), ' ', ...c);

export const link = (url: string, label: string) =>
  h('a', { href: url, target: url.startsWith('http') ? '_blank' : undefined, rel: url.startsWith('http') ? 'noopener noreferrer' : undefined }, label);

export function copyButton(text: string, label = 'copy') {
  const b = h('button', { type: 'button', class: 'copy', 'aria-label': `Copy ${text}` }, label);
  b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text);
      b.textContent = 'copied';
    } catch {
      b.textContent = 'press ⌘/Ctrl+C';
    }
    setTimeout(() => (b.textContent = label), 1600);
  });
  return b;
}

export function fromHTML(html: string): HTMLElement {
  // Only used for trusted, build-time strings (journey graph).
  const t = document.createElement('template');
  t.innerHTML = html;
  return t.content.firstElementChild as HTMLElement;
}

/** Privacy-friendly YouTube embed: thumbnail first, iframe (youtube-nocookie) only after a click. */
export function video(id: string, title: string) {
  const watch = `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
  const box = h('div', { class: 'o-video' });
  const play = h(
    'button',
    { type: 'button', class: 'o-video-play', 'aria-label': `Play video: ${title}` },
    h('img', { src: `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`, alt: '', loading: 'lazy', decoding: 'async' }),
    h('span', { class: 'o-video-icon', 'aria-hidden': 'true' }, '▶'),
  );
  play.addEventListener('click', () => {
    play.replaceWith(
      h('iframe', {
        src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`,
        title,
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowfullscreen: true,
      }),
    );
  });
  box.append(play, h('p', { class: 'o-video-cap' }, title, ' · ', link(watch, 'YouTube')));
  return box;
}
