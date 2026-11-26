// Terminal UI controller: prompt, autocomplete combobox, history, session persistence, viewers.
import { createRegistry, type Ctx } from './commands';
import type { Suggestion } from './engine';
import { h, cmd, error, muted, next } from './dom';

const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

const app = $('app');
const screen = $('screen');
const output = $('output');
const form = $<HTMLFormElement>('prompt');
const input = $<HTMLInputElement>('cmd');
const menu = $<HTMLUListElement>('suggest');
const cvView = $('cv');
const lightbox = $<HTMLDialogElement>('lightbox');
const palette = $<HTMLDialogElement>('palette');
const welcomeTemplate = $('welcome').cloneNode(true) as HTMLElement;
const coarse = matchMedia('(pointer: coarse)').matches;

const registry = createRegistry();

// ---- session --------------------------------------------------------------------------------
// Screen state (output transcript, scroll, draft) lives in sessionStorage: it survives reloads and
// returning from an article in the same tab, but every new visit opens on the welcome screen.
// Only command history persists across visits (localStorage), like a shell's history file.
const SCREEN_KEY = 'shafik.screen.v1';
const HISTORY_KEY = 'shafik.history.v1';
interface Session { history: string[]; transcript: string[]; welcome: boolean; draft: string; scroll: number }
const session: Session = { history: [], transcript: [], welcome: true, draft: '', scroll: 0 };
try {
  localStorage.removeItem('shafik.session.v1'); // old format kept screen state across visits
  session.history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  Object.assign(session, JSON.parse(sessionStorage.getItem(SCREEN_KEY) || '{}'));
} catch {}
const save = () => {
  session.draft = input.value;
  session.scroll = screen.scrollTop;
  const { history, ...screenState } = session;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-200)));
    sessionStorage.setItem(SCREEN_KEY, JSON.stringify({ ...screenState, transcript: screenState.transcript.slice(-60) }));
  } catch {}
};

// ---- output ---------------------------------------------------------------------------------
let entry: HTMLElement = output;
let replaying = false;

const ps1 = () => h('span', { class: 'ps1', 'aria-hidden': 'true' }, h('span', { class: 'ps1-user' }, 'visitor@shafik'), ':', h('span', { class: 'ps1-path' }, '~'), '$');

const ctx: Ctx = {
  out: (...nodes) => nodes.forEach((n) => n && entry.appendChild(n)),
  run: (line) => run(line),
  clear() {
    output.replaceChildren();
    entry = output;
    session.transcript = [];
    session.welcome = false;
  },
  home() {
    ctx.clear();
    output.appendChild(welcomeTemplate.cloneNode(true));
    session.welcome = true;
    screen.scrollTop = 0;
  },
  openCV: () => openCV(true),
  closeViewer: () => (cvView.hidden ? false : (closeCV(), true)),
  openImage(src, alt, caption) {
    const img = lightbox.querySelector('img')!;
    img.src = src;
    img.alt = alt;
    lightbox.querySelector('figcaption')!.textContent = caption;
    lightbox.showModal();
  },
  navigate(url) {
    save();
    location.href = url;
  },
  setTheme,
  get history() {
    return session.history;
  },
  base,
  get replay() {
    return replaying;
  },
  registry,
};

function run(raw: string, opts: { replay?: boolean } = {}) {
  const line = raw.trim();
  replaying = !!opts.replay;
  if (!opts.replay && line) {
    if (session.history.at(-1) !== line) session.history.push(line);
    session.transcript.push(line);
  }
  entry = h('section', { class: 'entry', 'aria-label': line ? `Output of ${line}` : 'Empty command' }, h('p', { class: 'echo' }, ps1(), ' ', h('kbd', null, line)));
  output.appendChild(entry);

  const r = registry.resolve(line);
  try {
    if (r.kind === 'ok') r.cmd.run(r.args, ctx);
    else if (r.kind === 'ambiguous')
      ctx.out(muted(`“${r.name}” matches more than one command:`), next(r.options.map((o) => [o, registry.get(o)!.desc])));
    else if (r.kind === 'unknown')
      ctx.out(
        h('p', { class: 'o-text o-err', role: 'alert' }, 'Command not found: ', h('kbd', null, r.name)),
        r.suggestion
          ? h('p', { class: 'o-text' }, 'Did you mean: ', cmd(r.suggestion), '?')
          : h('p', { class: 'o-text o-muted' }, 'Type ', cmd('help'), ' or pick a command from the suggestions.'),
      );
  } catch (e) {
    console.error(e);
    ctx.out(error('Something went wrong running that command.'));
  }
  replaying = false;
  if (!opts.replay) {
    // Bring the new output's first line into view (or the bottom, if it is short).
    if (entry.isConnected) screen.scrollTop = entry.offsetTop - 12;
    save();
  }
}

// ---- autocomplete (WAI-ARIA combobox + listbox) ---------------------------------------------
let items: Suggestion[] = [];
let active = -1;
let histIdx = -1;

function setOpen(open: boolean) {
  menu.hidden = !open;
  input.setAttribute('aria-expanded', String(open));
  if (!open) setActive(-1);
}

function setActive(i: number) {
  active = i;
  [...menu.children].forEach((li, j) => li.setAttribute('aria-selected', String(j === i)));
  if (i >= 0) {
    input.setAttribute('aria-activedescendant', `sug-${i}`);
    menu.children[i].scrollIntoView({ block: 'nearest' });
  } else input.removeAttribute('aria-activedescendant');
}

function refresh() {
  items = registry.complete(input.value);
  // Nothing more to suggest once the line exactly matches the only option.
  if (items.length === 1 && items[0].value === input.value.trim() && !items[0].more) items = [];
  const typed = input.value.trimStart().toLowerCase();
  menu.replaceChildren(
    ...items.map((s, i) => {
      const hit = s.value.toLowerCase().startsWith(typed) ? typed.length : 0;
      return h(
        'li',
        { id: `sug-${i}`, role: 'option', 'aria-selected': 'false', 'data-i': i },
        h('span', { class: 's-cmd' }, hit ? h('mark', null, s.value.slice(0, hit)) : '', s.value.slice(hit), s.more ? ' …' : ''),
        h('span', { class: 's-desc' }, s.desc),
      );
    }),
  );
  setOpen(items.length > 0 && document.activeElement === input);
  if (!menu.hidden) requestAnimationFrame(() => menu.scrollIntoView({ block: 'nearest' }));
}

function pick(s: Suggestion) {
  if (s.more) {
    input.value = s.value + ' ';
    refresh();
    input.focus();
  } else submit(s.value);
}

function submit(line: string) {
  input.value = '';
  histIdx = -1;
  setOpen(false);
  run(line);
}

function historyStep(dir: -1 | 1) {
  const hst = session.history;
  if (!hst.length) return;
  if (histIdx === -1) {
    if (dir === 1) return;
    session.draft = input.value;
    histIdx = hst.length;
  }
  histIdx += dir;
  if (histIdx < 0) histIdx = 0;
  if (histIdx >= hst.length) {
    histIdx = -1;
    input.value = session.draft;
  } else input.value = hst[histIdx];
  setOpen(false);
  requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
}

const commonPrefix = (xs: string[]) => xs.reduce((a, b) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return a.slice(0, i); });

input.addEventListener('keydown', (e) => {
  const open = !menu.hidden;
  if (e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'c' && input.selectionStart === input.selectionEnd) {
    e.preventDefault();
    entry = h('section', { class: 'entry' }, h('p', { class: 'echo' }, ps1(), ' ', h('kbd', null, input.value), h('span', { class: 'o-muted' }, '^C')));
    output.appendChild(entry);
    input.value = '';
    histIdx = -1;
    setOpen(false);
    screen.scrollTop = screen.scrollHeight;
    return;
  }
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      if (open && active > 0) setActive(active - 1);
      else if (open && active === 0) setActive(-1);
      else historyStep(-1);
      break;
    case 'ArrowDown':
      e.preventDefault();
      if (histIdx !== -1) historyStep(1);
      else if (!open) refresh(), setOpen(items.length > 0);
      else setActive(Math.min(active + 1, items.length - 1));
      break;
    case 'Tab': {
      if (!input.value.trim() || e.shiftKey) return; // never trap focus on an empty prompt
      e.preventDefault();
      if (!items.length) refresh();
      if (active >= 0 || items.length === 1) {
        const s = items[Math.max(active, 0)];
        input.value = s.value + (s.more || registry.get(s.value.split(' ')[0])?.args?.(s.value.split(' ').slice(1)).length ? ' ' : '');
      } else if (items.length) {
        const pre = commonPrefix(items.map((s) => s.value));
        if (pre.length > input.value.length) input.value = pre;
        else setActive(0);
      }
      if (active < 0 || items.length === 1) refresh();
      break;
    }
    case 'Enter':
      e.preventDefault();
      if (open && active >= 0) pick(items[active]);
      else submit(input.value);
      break;
    case 'Escape':
      if (open) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
      }
      break;
    case 'l':
      if (e.ctrlKey) {
        e.preventDefault();
        ctx.clear();
        save();
      }
      break;
  }
});

input.addEventListener('input', () => {
  histIdx = -1;
  refresh();
});
input.addEventListener('focus', () => {
  if (!quietFocus) refresh();
  quietFocus = false;
});
input.addEventListener('pointerdown', () => {
  if (document.activeElement === input) refresh();
});
form.addEventListener('focusout', (e) => {
  if (!form.contains(e.relatedTarget as Node)) setOpen(false);
});
form.addEventListener('submit', (e) => e.preventDefault());
menu.addEventListener('pointerdown', (e) => e.preventDefault()); // keep focus in the input
menu.addEventListener('click', (e) => {
  const li = (e.target as HTMLElement).closest('li');
  if (li) pick(items[Number(li.dataset.i)]);
});

let quietFocus = false;
function focusPrompt() {
  if (coarse) return; // never pop the virtual keyboard on touch devices
  quietFocus = true;
  input.focus({ preventScroll: true });
}

// ---- clickable commands anywhere ------------------------------------------------------------
document.addEventListener('click', (e) => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cmd]');
  if (t) {
    e.preventDefault();
    if (palette.open) palette.close();
    run(t.dataset.cmd!);
    focusPrompt();
    return;
  }
  if ((e.target as HTMLElement).closest('[data-nav]')) save();
});

// Click on empty terminal space focuses the prompt (without breaking text selection).
screen.addEventListener('mouseup', (e) => {
  if ((e.target as HTMLElement).closest('a,button,input,[data-cmd],table,dl,p,h2,h3,li')) return;
  if (!getSelection()?.toString()) focusPrompt();
});

// Typing anywhere goes to the prompt, like a real terminal.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !cvView.hidden) {
    e.preventDefault();
    closeCV();
    return;
  }
  if (e.ctrlKey && e.key.toLowerCase() === 'l' && document.activeElement !== input) {
    e.preventDefault();
    ctx.clear();
    save();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && cvView.hidden) {
    e.preventDefault();
    if (palette.open) palette.close();
    else palette.showModal();
    return;
  }
  const t = e.target as HTMLElement;
  if (!cvView.hidden || palette.open || lightbox.open) return;
  if (t === input || t.closest('input,textarea,select,[contenteditable]')) return;
  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== ' ') input.focus();
});

// ---- CV viewer ------------------------------------------------------------------------------
let returnFocus: Element | null = null;

function openCV(push: boolean) {
  if (cvView.hidden) {
    returnFocus = document.activeElement;
    cvView.hidden = false;
    app.inert = true;
    document.documentElement.classList.add('viewing');
    cvView.querySelector<HTMLElement>('[data-close]')!.focus();
    if (push && location.hash !== '#cv') history.pushState({ view: 'cv' }, '', '#cv');
  }
}

function closeCV(fromHistory = false) {
  if (cvView.hidden) return;
  cvView.hidden = true;
  app.inert = false;
  document.documentElement.classList.remove('viewing');
  if (!fromHistory) {
    if (history.state?.view === 'cv') history.back();
    else history.replaceState(null, '', location.pathname + location.search);
  }
  if (returnFocus instanceof HTMLElement && returnFocus.isConnected && returnFocus !== document.body && returnFocus !== input)
    returnFocus.focus({ preventScroll: true });
  else focusPrompt();
}

window.addEventListener('popstate', () => {
  if (location.hash === '#cv') openCV(false);
  else closeCV(true);
});

cvView.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  if (t.closest('[data-close]')) closeCV();
  else if (t.closest('[data-zoom]')) {
    const paper = cvView.querySelector<HTMLElement>('.paper')!;
    const z = Math.min(1.6, Math.max(0.7, (Number(paper.dataset.z) || 1) + Number((t.closest('[data-zoom]') as HTMLElement).dataset.zoom)));
    paper.dataset.z = z.toFixed(1);
    paper.style.setProperty('--zoom', z.toFixed(1));
    cvView.querySelector('[data-zoom-label]')!.textContent = `${Math.round(z * 100)}%`;
  }
});

// ---- dialogs --------------------------------------------------------------------------------
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox || (e.target as HTMLElement).closest('[data-close]')) lightbox.close();
});
palette.addEventListener('click', (e) => {
  if (e.target === palette || (e.target as HTMLElement).closest('[data-close]')) palette.close();
});
document.querySelectorAll('[data-palette]').forEach((b) => b.addEventListener('click', () => palette.showModal()));
document.querySelectorAll('[data-open-cv]').forEach((b) => b.addEventListener('click', () => openCV(true)));
document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => setTheme()));

// ---- theme ----------------------------------------------------------------------------------
function setTheme(t?: string) {
  const root = document.documentElement;
  const nextTheme = t === 'light' || t === 'dark' ? t : root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = nextTheme;
  try {
    localStorage.setItem('shafik.theme', nextTheme);
  } catch {}
  return nextTheme;
}

// ---- mobile virtual keyboard ----------------------------------------------------------------
const vv = window.visualViewport;
if (vv) {
  const fit = () => document.documentElement.style.setProperty('--app-h', `${vv.height}px`);
  vv.addEventListener('resize', fit);
  fit();
}

// ---- restore --------------------------------------------------------------------------------
if (!session.welcome) $('welcome').remove();
for (const line of session.transcript) run(line, { replay: true });
input.value = session.draft || '';
requestAnimationFrame(() => (screen.scrollTop = session.scroll || 0));
if (location.hash === '#cv') openCV(false);
else focusPrompt();

addEventListener('pagehide', save);
document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && save());
