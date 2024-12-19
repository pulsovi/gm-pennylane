#!/usr/bin/env node
import fs from 'node:fs';


const files = await fs.promises.readdir('.');
const meta = files.find(filename => filename.endsWith('.meta.js'))
const header = await fs.promises.readFile(meta, 'utf8');
const lines = header.split('\n');
const versionIndex = lines.findIndex(line => line.startsWith('// @version '));
const oldVersion = lines[versionIndex].slice('// @version').trim();
const newVersion = oldVersion.split('.')
  .reverse().map((part, pos) => pos === 0 ? parseInt(part, 10) + 1 : part)
  .reverse().join('.');
lines[versionIndex] = lines[versionIndex].replace(oldVersion, newVersion);
await fs.promises.writeFile(meta, lines.join('\n'), 'utf8');

const browser = await fs.promises.readFile('./src/eval.ts', 'utf8');
await fs.promises.writeFile(
  './src/eval.ts',
  browser.replace(/(?<=^\/\*\* version \*\*\/)[^,]*/um, `'${newVersion.split(' ').pop()}'`),
  'utf8'
);
