// Renders the engineering-journey git graph to an HTML string.
// Used server-side (welcome screen, indexable) and client-side (`journey` command).
// Input is static profile data, but everything is still escaped.
import { journey, type JourneyRow } from '../data/profile';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const LANE = 18;
const PAD = 9;
const x = (lane: number) => PAD + lane * LANE;
const WIDTH = x(1) + PAD;
const H = 20;

function lines(lanes: number[], row: Extract<JourneyRow, { kind: 'node' }>) {
  return lanes
    .map((l) => {
      const cut = l === row.lane ? (row.first ? ' from-node' : row.last ? ' to-node' : '') : '';
      return `<span class="j-line lane-${l}${cut}" style="left:${x(l)}px"></span>`;
    })
    .join('');
}

function connector(row: Extract<JourneyRow, { kind: 'fork' | 'merge' }>) {
  const straight = row.lanes.map((l) => `<path class="lane-${l}" d="M${x(l)} 0V${H}"/>`).join('');
  const lane = row.kind === 'fork' ? row.to : row.from;
  const curve = `<path class="lane-${lane}" d="M${x(row.from)} 0C${x(row.from)} ${H * 0.6},${x(row.to)} ${H * 0.4},${x(row.to)} ${H}"/>`;
  return `<li class="j-row j-conn" aria-hidden="true"><svg width="${WIDTH}" height="${H}" viewBox="0 0 ${WIDTH} ${H}">${straight}${curve}</svg></li>`;
}

export function journeyHTML(): string {
  const rows = journey.map((row) => {
    if (row.kind !== 'node') return connector(row);
    const tag = row.head
      ? `<span class="j-tag head">HEAD → now</span>`
      : row.tag
        ? `<span class="j-tag lane-${row.lane}">${esc(row.tag)}</span>`
        : '';
    const sub = row.sub
      ? `<ul class="j-sub">${row.sub
          .map((s, i, a) => `<li><span class="j-tree" aria-hidden="true">${i === a.length - 1 ? '└─' : '├─'}</span><button type="button" class="cmd" data-cmd="${esc(s.cmd)}">${esc(s.label)}</button></li>`)
          .join('')}</ul>`
      : '';
    return `<li class="j-row j-node${row.head ? ' is-head' : ''}">
      <div class="j-graph" style="width:${WIDTH}px" aria-hidden="true">${lines(row.lanes, row)}<span class="j-dot lane-${row.lane}" style="left:${x(row.lane)}px"></span></div>
      <div class="j-body" style="padding-left:${row.lane * LANE}px">
        <button type="button" class="j-btn" data-cmd="${esc(row.cmd)}" title="Run: ${esc(row.cmd)}"><span class="j-title">${esc(row.title)}</span>${tag}${row.when ? `<span class="j-when">${esc(row.when)}</span>` : ''}<span class="j-meta">${esc(row.meta)}</span></button>${sub}
      </div></li>`;
  });
  return `<ol class="journey" aria-label="Engineering journey, from Textile Engineering to Agentic AI">${rows.join('')}</ol>`;
}
