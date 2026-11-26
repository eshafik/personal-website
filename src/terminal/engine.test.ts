// Run: npm test
import assert from 'node:assert/strict';
import { Registry, tokenize, distance, type Command } from './engine.ts';

const noop = () => {};
const cmds: Command<null>[] = [
  { name: 'experience', desc: 'Professional experience', primary: true, run: noop, args: () => [{ value: 'mevrik' }, { value: 'strativ' }] },
  { name: 'expertise', desc: 'Engineering capabilities', primary: true, run: noop, args: () => [{ value: 'ai' }] },
  { name: 'about', aliases: ['whoami'], desc: 'About', primary: true, run: noop },
  { name: 'research', desc: 'Research', run: noop, args: (t) => (t[0] === 'open' ? [{ value: 'my-article' }] : [{ value: 'open' }, { value: 'list' }]) },
];
const r = new Registry(cmds);

assert.deepEqual(tokenize('  research   search "agentic ai" '), ['research', 'search', 'agentic ai']);
assert.equal(distance('experince', 'experience'), 1);
assert.equal(distance('abuot', 'about'), 1);

// resolve: exact, case, alias, prefix, ambiguous, typo, empty
assert.equal((r.resolve('EXPERIENCE mevrik') as any).cmd.name, 'experience');
assert.deepEqual((r.resolve('experience Mevrik') as any).args, ['Mevrik']);
assert.equal((r.resolve('whoami') as any).cmd.name, 'about');
assert.equal((r.resolve('res') as any).cmd.name, 'research');
assert.deepEqual(r.resolve('exp'), { kind: 'ambiguous', name: 'exp', options: ['experience', 'expertise'] });
assert.deepEqual(r.resolve('experince'), { kind: 'unknown', name: 'experince', suggestion: 'experience' });
assert.equal((r.resolve('zzzzzz') as any).suggestion, undefined);
assert.equal(r.resolve('   ').kind, 'empty');

// complete
assert.deepEqual(r.complete('').map((s) => s.value), ['experience', 'expertise', 'about']);
assert.deepEqual(r.complete('ex').map((s) => s.value), ['experience', 'expertise']);
assert.deepEqual(r.complete('who').map((s) => s.value), ['about']);
assert.deepEqual(r.complete('experience').map((s) => s.value), ['experience', 'experience mevrik', 'experience strativ']);
assert.deepEqual(r.complete('experience s').map((s) => s.value), ['experience strativ']);
assert.deepEqual(r.complete('research open ').map((s) => s.value), ['research open my-article']);
assert.deepEqual(r.complete('experience s'), [{ value: 'experience strativ', desc: '', more: undefined }]);
assert.deepEqual(r.complete('about '), []);

console.log('engine: all tests passed');
