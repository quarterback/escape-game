#!/usr/bin/env node
/* Runs the owner's standalone checker (quarterback/pbbg-content-schema) over the game's copy.
   Set PBBG_SCHEMA to that repo's path; defaults try ../pbbg-content-schema and ../quarterback/pbbg-content-schema.
   node tools/pbbg-check.js [--json] */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const root = path.join(__dirname, '..');
const cands = [process.env.PBBG_SCHEMA, path.join(root, '..', 'pbbg-content-schema'), path.join(root, '..', 'quarterback', 'pbbg-content-schema')].filter(Boolean);
const repo = cands.find(d => fs.existsSync(path.join(d, 'bin', 'pbbg-content.js')));
if (!repo) { console.error('pbbg-check: clone https://github.com/quarterback/pbbg-content-schema beside this repo or set PBBG_SCHEMA'); process.exit(2); }
const out = path.join(os.tmpdir(), 'coalition-bundle.json');
fs.writeFileSync(out, cp.execFileSync(process.execPath, [path.join(__dirname, 'pbbg-bundle.js')]));
const r = cp.spawnSync(process.execPath, [path.join(repo, 'bin', 'pbbg-content.js'), 'check', out, '--policy', path.join(__dirname, 'pbbg-policy.json'), ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(r.status);
