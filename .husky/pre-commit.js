#!/usr/bin/env node
import fs from 'node:fs';

const main = await fs.promises.readFile('main.js', 'utf8');
const template = await fs.promises.readFile('template.js', 'utf8');
const script = (await fs.promises.readdir('.')).find(item => item.endsWith('.user.js'));
const content = template.split('/*main*/').join(JSON.stringify(main));
await fs.promises.writeFile(script, content, 'utf8');

const lines = content.split('\n');
const meta = lines.slice(0, lines.indexOf('// ==/UserScript==') + 1).join('\n');
const metaFile = script.replace(/.user.js$/u, '.meta.js');
await fs.promises.writeFile(metaFile, meta, 'utf8');
