#!/usr/bin/env node

const yargs = require('yargs');
const concat = require('concat-files');
const fs = require('fs');
const path = require('path');
const Hashids = require('hashids');
const lodash = require('lodash');

const argv = yargs.argv;
const distPath = argv._[0] || './dist';

const hash = (new Hashids()).encode(Math.floor(new Date() / 1000));
const indexFileName = path.join(distPath, 'index.html');

// Make webpack bundle unique with same hash
console.log(`Replacing [PE_HASH] key inside index.html using hash ${hash}...`);

replace(indexFileName, '[PE_HASH]', hash);

/*** Utils ***/

function replace(file, searchString, hash) {
  const content = fs.readFileSync(file, 'utf8');
  const searchRegexp = new RegExp(lodash.escapeRegExp(searchString), 'g');
  const result = content.replace(searchRegexp, hash);
  fs.writeFileSync(file, result);
}
