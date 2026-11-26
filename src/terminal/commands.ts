import { profile } from '../data/profile';
import { Registry, type Arg, type Command } from './engine';
import { h, cmd, heading, p, muted, kv, list, next, error, link, copyButton, fromHTML, video } from './dom';
import type { Media } from '../data/profile';
import { journeyHTML } from './journey';

export interface Ctx {
  out: (...nodes: (Node | false | undefined)[]) => void;
  run: (line: string) => void;
  clear: () => void;
  home: () => void;
  openCV: () => void;
  closeViewer: () => boolean;
  openImage: (src: string, alt: string, caption: string) => void;
  navigate: (url: string) => void;
  setTheme: (t?: string) => string;
  history: string[];
  base: string;
  replay: boolean;
  registry: Registry<Ctx>;
}

type C = Command<Ctx>;
const P = profile;
const opts = <T extends { id: string }>(xs: T[], desc: (x: T) => string): Arg[] => xs.map((x) => ({ value: x.id, desc: desc(x) }));
const findBy = <T extends { id: string; aliases?: string[] }>(xs: T[], q?: string) =>
  q ? xs.find((x) => x.id === q.toLowerCase() || x.aliases?.includes(q.toLowerCase())) : undefined;

function notFound(ctx: Ctx, what: string, q: string, choices: string[], base: string) {
  ctx.out(error(`No ${what} named “${q}”.`), next(choices.map((c) => [`${base} ${c}`, ''])));
}

// ---- renderers ------------------------------------------------------------------------------

function experienceEntry(e: (typeof P.experience)[number], full: boolean) {
  return h(
    'article',
    { class: `o-reg-item${e.current ? ' is-current' : ''}` },
    h(
      'header',
      null,
      h('h3', null, full ? e.company : cmd(`experience ${e.id}`, e.company)),
      h('span', { class: 'o-role' }, e.role),
      e.period && h('span', { class: e.current ? 'o-status' : 'o-period' }, e.current && '● ', e.period),
    ),
    h('p', { class: 'o-domain' }, e.domain, e.location && ` · ${e.location}`),
    full && p(e.summary),
    e.products && kv(e.products.map((x) => [x.name, x.description])),
    (full || e.current) && list(e.work, 'o-bullets'),
  );
}

// ---- commands -------------------------------------------------------------------------------

const about: C = {
  name: 'about',
  aliases: ['whoami'],
  desc: 'Personal introduction',
  primary: true,
  run: (_, ctx) =>
    ctx.out(
      heading(`${P.name} (${P.alias})`, P.title),
      p(P.summary),
      p(P.stack),
      ...P.story.map((s) => p(s)),
      kv([
        ['now', `${P.role} at ${P.company.name}`],
        ['focus', P.focus.join(' · ')],
        ['based in', P.location],
      ]),
      next([
        ['journey', 'See the path from textiles to AI'],
        ['experience mevrik', 'Current role'],
        ['cv', 'Open the full CV'],
      ]),
    ),
};

const journeyCmd: C = {
  name: 'journey',
  desc: 'Engineering journey, textiles → AI',
  primary: true,
  run: (_, ctx) =>
    ctx.out(
      heading('Engineering journey', 'git log --graph --reverse'),
      p('Textile Engineering → Robotics → Renewable Energy → Digital Commerce → Healthcare Technology → Intelligent Communication → Agentic AI.'),
      fromHTML(journeyHTML()),
      muted('Every node is clickable.'),
      next([
        ['robotics', 'Where programming began'],
        ['education', 'From textiles to computer science'],
      ]),
    ),
};

const experience: C = {
  name: 'experience',
  aliases: ['work', 'jobs'],
  desc: 'Professional experience',
  usage: 'experience [company]',
  primary: true,
  args: (t) => (t.length ? [] : opts(P.experience, (e) => `${e.role} · ${e.domain}`)),
  run: ([q], ctx) => {
    if (q) {
      const e = findBy(P.experience, q);
      if (!e) return notFound(ctx, 'company', q, P.experience.map((x) => x.id), 'experience');
      const i = P.experience.indexOf(e);
      const after = P.experience[i + 1];
      return ctx.out(
        h('div', { class: 'o-reg' }, experienceEntry(e, true)),
        next([
          ...(after ? ([[`experience ${after.id}`, `Previous: ${after.company}`]] as [string, string][]) : []),
          ['experience', 'All experience'],
          e.current ? ['expertise', 'Engineering capabilities'] : ['journey', 'See how it connects'],
        ]),
      );
    }
    ctx.out(
      heading('Experience', `${P.experience.length} roles · most recent first`),
      h('div', { class: 'o-reg' }, P.experience.map((e) => experienceEntry(e, false))),
      next([
        ['experience mevrik', 'Current role in detail'],
        ['expertise', 'Engineering capabilities'],
        ['cv', 'Open complete CV'],
      ]),
    );
  },
};

const expertise: C = {
  name: 'expertise',
  aliases: ['skills'],
  desc: 'Engineering capabilities',
  usage: 'expertise [area]',
  primary: true,
  args: (t) => (t.length ? [] : opts(P.expertise, (x) => x.title)),
  run: ([q], ctx) => {
    const items = q ? [findBy(P.expertise, q)] : P.expertise;
    if (!items[0]) return notFound(ctx, 'area', q, P.expertise.map((x) => x.id), 'expertise');
    ctx.out(
      !q && heading('Expertise', 'interconnected disciplines'),
      h(
        'div',
        { class: 'o-grid' },
        items.map((x) =>
          h(
            'section',
            { class: 'o-disc' },
            h('h3', null, q ? x!.title : cmd(`expertise ${x!.id}`, x!.title)),
            h('p', { class: 'o-muted' }, x!.summary),
            list(x!.areas, 'o-bullets'),
          ),
        ),
      ),
      next(q ? [['expertise', 'All disciplines'], ['experience mevrik', 'Where this is applied now']] : [['projects', 'Selected projects'], ['ventures', 'What I’m building']]),
    );
  },
};

const education: C = {
  name: 'education',
  aliases: ['edu'],
  desc: 'Academic qualifications',
  usage: 'education [masters|bachelors|diploma|ssc]',
  primary: true,
  args: (t) => (t.length ? [] : opts(P.education, (x) => x.short)),
  run: ([q], ctx) => {
    const items = q ? [findBy(P.education, q)] : P.education;
    if (!items[0]) return notFound(ctx, 'qualification', q, P.education.map((x) => x.id), 'education');
    ctx.out(
      !q && heading('Education', 'Textile Engineering → Computer Science'),
      h(
        'table',
        { class: 'o-table' },
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Qualification'), h('th', { scope: 'col' }, 'Institution'), h('th', { scope: 'col' }, 'Result'), h('th', { scope: 'col' }, 'Year'))),
        h(
          'tbody',
          null,
          items.map((e) =>
            h('tr', null, h('th', { scope: 'row' }, e!.degree), h('td', null, e!.institution ?? '—'), h('td', { class: 'o-num' }, e!.score), h('td', { class: 'o-num' }, e!.period ?? '')),
          ),
        ),
      ),
      p('Trained first as a textile engineer. Programming started through robotics at DUET; after moving into software, I completed a master’s in Computer Science in 2024.'),
      next([
        ['robotics', 'How robotics led to software'],
        ['journey', 'The full path'],
      ]),
    );
  },
};

function gallery(ctx: Ctx, media: Media[]) {
  return h(
    'div',
    { class: 'o-figures' },
    media.map((m) =>
      h(
        'figure',
        null,
        h(
          'button',
          { type: 'button', class: 'o-fig', 'aria-label': `View photo: ${m.alt}`, onclick: () => ctx.openImage(ctx.base + m.src, m.alt, m.caption) },
          h('img', { src: ctx.base + m.src, alt: m.alt, loading: 'lazy', decoding: 'async' }),
        ),
        h('figcaption', null, m.caption),
      ),
    ),
  );
}

const awardTitle = (a: (typeof P.robotics.awards)[number]) => `${a.place} — ${a.event} ${a.year}`;

const robotics: C = {
  name: 'robotics',
  desc: 'Robotics journey and projects',
  primary: true,
  run: (_, ctx) => {
    const r = P.robotics;
    ctx.out(
      heading('Robotics', `${r.team} · team leader`),
      p(r.intro),
      h(
        'div',
        { class: 'o-reg' },
        r.awards.map((a) =>
          h(
            'article',
            { class: `o-reg-item${a.place === 'Champion' ? ' is-current' : ''}` },
            h('header', null, h('h3', null, awardTitle(a))),
            h('p', { class: 'o-domain' }, a.host),
            a.note && p(a.note),
            gallery(ctx, a.media),
            a.video && h('div', { class: 'o-videos' }, video(a.video.id, a.video.title)),
          ),
        ),
      ),
      h('h3', { class: 'o-sub' }, 'Industrial AGVs'),
      p(r.agv),
      h('div', { class: 'o-videos' }, r.agvVideos.map((v) => video(v.id, v.title))),
      muted(r.closing),
      next([
        ['achievements', 'Awards at a glance'],
        ['experience', 'What came next'],
      ]),
    );
  },
};

const achievements: C = {
  name: 'achievements',
  aliases: ['awards'],
  desc: 'Awards and achievements',
  primary: true,
  run: (_, ctx) =>
    ctx.out(
      heading('Achievements', `${P.robotics.team} · national autonomous robotics`),
      h(
        'table',
        { class: 'o-table' },
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Result'), h('th', { scope: 'col' }, 'Competition'), h('th', { scope: 'col' }, 'Year'), h('th', { scope: 'col' }, 'Host'))),
        h(
          'tbody',
          null,
          P.robotics.awards.map((a) =>
            h('tr', null, h('th', { scope: 'row' }, a.place), h('td', null, a.event, a.note && h('span', { class: 'o-muted o-cell-note' }, a.note)), h('td', { class: 'o-num' }, a.year), h('td', null, a.host)),
          ),
        ),
      ),
      next([['robotics', 'Photos, videos and the full story']]),
    ),
};

const projects: C = {
  name: 'projects',
  desc: 'Engineering projects',
  usage: 'projects [id]',
  primary: true,
  args: (t) => (t.length ? [] : opts(P.projects, (x) => x.title)),
  run: ([q], ctx) => {
    const items = q ? [findBy(P.projects, q)] : P.projects;
    if (!items[0]) return notFound(ctx, 'project', q, P.projects.map((x) => x.id), 'projects');
    ctx.out(
      !q && heading('Projects', 'selected work, in context'),
      h(
        'div',
        { class: 'o-reg' },
        items.map((x) =>
          h(
            'article',
            { class: 'o-reg-item' },
            h('header', null, h('h3', null, q ? x!.title : cmd(`projects ${x!.id}`, x!.title)), h('span', { class: 'o-role' }, x!.context)),
            p(x!.description),
            list(x!.contributions, 'o-bullets'),
            x!.links?.length && h('p', null, x!.links.map((l) => [link(l.url, l.label), ' '])),
            q && x!.videos?.length && h('div', { class: 'o-videos' }, x!.videos.map((v) => video(v.id, v.title))),
          ),
        ),
      ),
      next(q ? [['projects', 'All projects']] : [['expertise', 'Capabilities behind them'], ['ventures', 'Technurah & Kids Lab']]),
    );
  },
};

const ventures: C = {
  name: 'ventures',
  aliases: ['building', 'startups', 'technurah', 'kidslab'],
  desc: 'Technurah & Kids Lab Center',
  primary: true,
  run: (_, ctx) =>
    ctx.out(
      heading('Ventures', 'what I’m building beyond Mevrik'),
      h(
        'div',
        { class: 'o-reg' },
        P.ventures.map((v) =>
          h(
            'article',
            { class: 'o-reg-item is-current' },
            h('header', null, h('h3', null, link(v.url, `${v.name} ↗`)), v.role && h('span', { class: 'o-role' }, v.role)),
            h('p', { class: 'o-domain' }, v.tagline, ' · ', link(v.url, v.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))),
            p(v.description),
          ),
        ),
      ),
      next([['projects', 'Engineering projects'], ['contact', 'Get in touch']]),
    ),
};

const cv: C = {
  name: 'cv',
  aliases: ['resume'],
  desc: 'Open full-screen CV',
  primary: true,
  run: (_, ctx) => {
    if (ctx.replay) return ctx.out(muted('Opened CV viewer.'));
    ctx.openCV();
    ctx.out(muted('Opened CV viewer. Press Esc to return.'));
  },
};

const contact: C = {
  name: 'contact',
  desc: 'Contact information',
  primary: true,
  run: (_, ctx) => {
    const { email, phone } = P.contact;
    const rows: [string, Node][] = [];
    if (email) rows.push(['email', h('span', null, link(`mailto:${email}`, email), ' ', copyButton(email))]);
    if (phone) rows.push(['phone', h('span', null, link(`tel:${phone.replace(/\s/g, '')}`, phone), ' ', copyButton(phone))]);
    const linkedin = P.links.find((l) => l.label === 'LinkedIn');
    if (linkedin) rows.push(['linkedin', h('span', null, link(linkedin.url, linkedin.display ?? linkedin.url), ' ', copyButton(linkedin.url))]);
    ctx.out(
      heading('Contact'),
      rows.length ? kv(rows) : muted('Contact details have not been published yet.'),
      kv([['location', P.location]]),
      next([['links', 'Professional profiles'], ['cv', 'Open CV']]),
    );
  },
};

const links: C = {
  name: 'links',
  aliases: ['social'],
  desc: 'Professional and social profiles',
  primary: true,
  run: (_, ctx) =>
    ctx.out(
      heading('Links'),
      P.links.length
        ? kv(P.links.map((l) => [l.label, h('span', null, link(l.url, l.display ?? l.url.replace(/^https?:\/\/(www\.)?/, '')), l.note && h('span', { class: 'o-muted' }, ` — ${l.note}`), ' ', copyButton(l.url))]))
        : muted('Profiles have not been published yet.'),
    ),
};

const help: C = {
  name: 'help',
  aliases: ['?', 'commands'],
  desc: 'Available commands',
  primary: true,
  run: (_, ctx) => {
    const all = ctx.registry.commands;
    ctx.out(
      heading('Commands', 'click any command, or type it'),
      h(
        'table',
        { class: 'o-table o-help' },
        h('tbody', null, all.map((c) => h('tr', null, h('th', { scope: 'row' }, cmd(c.name)), h('td', null, c.desc), h('td', { class: 'o-muted' }, c.aliases?.join(', ') ?? '')))),
      ),
      heading('Keys'),
      kv([
        ['Tab', 'Autocomplete'],
        ['↑ / ↓', 'Move through suggestions, or history'],
        ['Enter', 'Run'],
        ['Esc', 'Dismiss suggestions / close viewer'],
        ['Ctrl+L', 'Clear screen'],
        ['Ctrl+C', 'Cancel input'],
      ]),
      next([['man experience', 'Detailed documentation for a command']]),
    );
  },
};

const clear: C = { name: 'clear', aliases: ['cls'], desc: 'Clear terminal output', run: (_, ctx) => ctx.clear() };
const home: C = { name: 'home', aliases: ['~', 'cd'], desc: 'Restore the initial view', run: (_, ctx) => ctx.home() };
const exit: C = {
  name: 'exit',
  aliases: ['quit', 'q'],
  desc: 'Close the current viewer or return home',
  run: (_, ctx) => {
    if (!ctx.closeViewer()) ctx.home();
  },
};

const ls: C = {
  name: 'ls',
  aliases: ['dir'],
  desc: 'List content categories',
  run: (_, ctx) =>
    ctx.out(
      h(
        'ul',
        { class: 'o-ls' },
        [
          ['about.txt', 'cat about'],
          ['journey/', 'journey'],
          ['experience/', 'experience'],
          ['expertise/', 'expertise'],
          ['education/', 'education'],
          ['robotics/', 'robotics'],
          ['achievements.txt', 'achievements'],
          ['projects/', 'projects'],
          ['ventures/', 'ventures'],
          ['cv', 'cv'],
          ['contact.txt', 'contact'],
          ['links.txt', 'links'],
        ].map(([n, c]) => h('li', null, cmd(c, n))),
      ),
    ),
};

const pwd: C = { name: 'pwd', desc: 'Current location', run: (_, ctx) => ctx.out(p(`/home/${P.handle}`)) };

const catMap: Record<string, string> = {
  about: 'about', 'about.txt': 'about', journey: 'journey', experience: 'experience', expertise: 'expertise',
  education: 'education', robotics: 'robotics', achievements: 'achievements', 'achievements.txt': 'achievements',
  projects: 'projects', ventures: 'ventures', contact: 'contact', 'contact.txt': 'contact', links: 'links', 'links.txt': 'links', cv: 'cv',
};
const cat: C = {
  name: 'cat',
  aliases: ['less', 'more', 'open'],
  desc: 'Read a content resource',
  usage: 'cat <resource>',
  args: (t) => (t.length ? [] : ['about', 'experience', 'education', 'expertise', 'robotics', 'achievements', 'projects', 'ventures', 'contact', 'links'].map((v) => ({ value: v }))),
  run: ([r], ctx) => {
    const target = r && catMap[r.toLowerCase().replace(/\/$/, '')];
    if (!target) return ctx.out(error(r ? `cat: ${r}: No such file` : 'Usage: cat <resource>'), next([['ls', 'List resources']]));
    ctx.registry.get(target)!.run([], ctx);
  },
};

const history: C = {
  name: 'history',
  desc: 'Commands you have run',
  run: (_, ctx) =>
    ctx.out(
      ctx.history.length
        ? h('ol', { class: 'o-history' }, ctx.history.map((c) => h('li', null, cmd(c))))
        : muted('No history yet.'),
    ),
};

const man: C = {
  name: 'man',
  desc: 'Command documentation',
  usage: 'man <command>',
  args: (t) => (t.length ? [] : registryRef.commands.map((c) => ({ value: c.name, desc: c.desc }))),
  run: ([name], ctx) => {
    const c = name && ctx.registry.get(name);
    if (!c) return ctx.out(error(name ? `No manual entry for ${name}` : 'What manual page do you want? Try: man experience'));
    const argList = c.args?.([]) ?? [];
    ctx.out(
      heading(`${c.name.toUpperCase()}(1)`, 'manual'),
      kv([
        ['NAME', `${c.name} — ${c.desc}`],
        ['SYNOPSIS', c.usage ?? c.name],
        ['DESCRIPTION', c.man ?? c.desc],
        ...(c.aliases?.length ? ([['ALIASES', c.aliases.join(', ')]] as [string, string][]) : []),
        ...(argList.length ? ([['ARGUMENTS', h('span', null, argList.map((a) => h('span', { class: 'o-arg' }, cmd(`${c.name} ${a.value}`, a.value), a.desc && ` ${a.desc}`)))]] as [string, Node][]) : []),
      ]),
    );
  },
};

const theme: C = {
  name: 'theme',
  desc: 'Switch light / dark theme',
  usage: 'theme [dark|light]',
  args: (t) => (t.length ? [] : [{ value: 'dark' }, { value: 'light' }]),
  run: ([t], ctx) => ctx.out(muted(`Theme: ${ctx.setTheme(t)}`)),
};

let registryRef: Registry<Ctx>;

export function createRegistry() {
  return (registryRef = new Registry<Ctx>(commands));
}

const commands: C[] = [
  about, journeyCmd, experience, expertise, education, robotics, achievements, projects, ventures, cv, contact, links, help,
  ls, cat, man, history, pwd, theme, clear, home, exit,
];
