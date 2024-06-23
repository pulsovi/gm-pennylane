#!/usr/bin/env node
import fs from 'node:fs';
const content = await fs.promises.readFile('template.js', 'utf8');
const lines = content.split('\n');
const versionIndex = lines.findIndex(line => line.startsWith('// @version '));
const oldVersion = lines[versionIndex].slice('// @version').trim();
const newVersion = oldVersion.split('.')
  .reverse().map((part, pos) => pos === 0 ? parseInt(part, 10) + 1 : part)
  .reverse().join('.');
lines[versionIndex] = lines[versionIndex].replace(oldVersion, newVersion);
await fs.promises.writeFile('template.js', lines.join('\n'), 'utf8');
