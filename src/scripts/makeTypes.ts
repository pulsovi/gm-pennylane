import npath from 'node:path';
import { pipeline, Readable, Writable, Transform } from 'node:stream';

import fs from 'fs-extra';
import * as makeTypes from 'generate-ts-types';

const { Emitter, NopWriter, StreamWriter } = makeTypes;

async function main() {
  pipeline(
    listClasses(),
    emitProxy(),
    log(),
    error => {
      if (error) {
        console.log('main pipeline error', error);
        debugger;
        process.exit(1);
      }
      else console.log('end process');
    }
  );
}

function listClasses() {
  const stream = new Readable({
    objectMode: true,
    read() {},
  });
  pushClasses();
  return stream;

  async function pushClasses() {
    const folders = (await fs.readdir('src/api', { withFileTypes: true }))
      .filter(dirent => dirent.isDirectory())
      .map(dirent => npath.join(dirent.parentPath, dirent.name));
    await Promise.all(folders.map(async folder => {
      (await fs.readdir(folder))
        .filter(file => file.endsWith('src.json'))
        .forEach(file => {
          stream.push(npath.join(folder, file))
        });
    }));
    stream.push(null);
  }
}

function emitProxy () {
  return new Transform({
    objectMode: true,
    async transform(samples: string, encoding, callback) {
      try {
        const main = npath.basename(samples) === 'src.json';
        const dest = main ?
          npath.join(samples, '../index.ts') :
          samples.replace(/src.json$/u, 'ts');
        const folderName = samples.split(npath.sep).slice(-2, -1)[0];
        const rootName = `API${folderName}${main ? '' : npath.basename(dest).replace(/.ts$/u, '')}`;
        const emitter = new Emitter(
          new NopWriter(),
          new StreamWriter(fs.createWriteStream(dest)),
          { postfixProxy: false }
        );
        emitter.emit(await fs.readJson(samples), rootName);
        this.push(dest);
      } catch (error) { return callback(error); }
      callback();
    },
  })
}

function log() {
  return new Writable({
    objectMode: true,
    write(chunk, encoding, callback) {
      console.log({ chunk });
      callback();
    },
  });
}

main();
//setTimeout(() => console.log('lol'), 5000);
