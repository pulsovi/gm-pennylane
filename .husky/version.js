#!/usr/bin/env node
import fs from 'node:fs';
const script = (await fs.promises.readdir('.')).find(item => item.endsWith('.user.js'));
const content = await fs.promises.readFile(script, 'utf8');
const lines = content.split('\n');
const versionIndex = lines.findIndex(line => line.startsWith('// @version '));
const oldVersion = lines[versionIndex].slice('// @version').trim();
const newVersion = oldVersion.split('.')
  .reverse().map((part, pos) => pos === 0 ? parseInt(part, 10) + 1 : part)
  .reverse().join('.');
lines[versionIndex] = lines[versionIndex].replace(oldVersion, newVersion);
await fs.promises.writeFile(script, lines.join('\n'), 'utf8');
