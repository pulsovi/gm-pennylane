#!/usr/bin/env node
import fs from 'node:fs';

const browser = await fs.promises.readFile('./dist/eval.cjs', 'utf8');
const main = await fs.promises.readFile('./dist/main.cjs', 'utf8');
const files = await fs.promises.readdir('.');
const header = await fs.promises.readFile(files.find(filename => filename.endsWith('.meta.js')));
const script = files.find(item => item.endsWith('.user.js'));
const content = (header + main).split('evalContent').join(JSON.stringify(browser).replace(/\\n/gu, '\\n" +\n"'));
await fs.promises.writeFile(script, content, 'utf8');
