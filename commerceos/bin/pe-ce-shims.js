#!/usr/bin/env node

const yargs = require('yargs');
const { transformFileSync } = require('babel-core');
const {
  writeFileSync,
  copyFileSync,
  mkdirSync,
  readFileSync
} = require('fs');
const {
  basename,
  join,
  dirname,
  sep,
  resolve
} = require('path');

const DEFAULT_GENERATE_OUTPUT = 'src';
const CUSTOM_ELEMENTS_SHIM_LOADER_SOURCE = 'js/custom-elements-shims-loader.js';
const REPLACE_BASEDIR_TOKEN = '[REPLACE_BASE_DIR]';

const DEFAULT_SHIMS_TO_TRANSPILE = [
  dirname(require.resolve('@webcomponents/custom-elements')) + '/src/native-shim.js'
];

const DEFAULT_SHIMS_DEST = 'dist/custom-elements-shims';

const SHIMS_TO_COPY = [
  dirname(require.resolve('@webcomponents/custom-elements')) + '/custom-elements.min.js',
  dirname(require.resolve('@webcomponents/custom-elements')) + '/src/native-shim.js',
  dirname(require.resolve('@webcomponents/custom-elements')) + '/src/native-shim.es5.js'
];

const BABEL_ES5_PRESETS = [
  dirname(require.resolve('babel-preset-env'))
];

/* eslint-disable-next-line no-unused-expressions */
yargs
  .usage('Usage: $0 <transpile|copy|generate-loader> [-h|-help|options]')
  // Transpile
  .command(
    'transpile [files]',
    'Transpile some shims to get it works in old browsers',
    args => args
      .positional('files', {
        describe: 'Shim/polyfill files to transpile',
        default: DEFAULT_SHIMS_TO_TRANSPILE,
        nargs: 100
      }),
    argv => {
      console.log(`Transpiling files [${argv.files.join(', ')}]...`);
      transpileShims(argv.files);
      console.log('Transpiling done\n');
    }
  )
  // Copy
  .command(
    'copy [dest]',
    'Copy shim/polyfill files to build output directory',
    args => args
      .positional('dest', {
        describe: 'Output folder to copy',
        default: DEFAULT_SHIMS_DEST
      }),
    argv => {
      console.log(`Copying files to "${argv.dest}"...`);
      copyShimsTo(argv.dest);
      console.log('Copying done\n');
    }
  )
  // Generate loader
  .command(
    'generate-loader [--bp|--o]',
    'Generate Custom Elements shims loading script',
    args => args
      .example('$0 generate-loader --basePath=/dist_ext/checkout/ --out=src')
      .option('basePath', {
        describe: 'URL prefix (with leading & trailing slashes) where your shims/polyfills will be stored on production build (and aliased in dev mode) for loading by generated loader',
        alias: ['bp'],
        demandOption: true
      })
      .option('out', {
        describe: 'Path where generated shims/polyfills loading scriopt will be saved',
        alias: 'o',
        default: DEFAULT_GENERATE_OUTPUT
      }),
    argv => {
      console.log(`Generating loader for "${argv.basePath}" basePath to "${argv.out}" folder...`);
      generateLoader(argv.basePath, argv.out || DEFAULT_GENERATE_OUTPUT);
      console.log('Generating done\n');
    }
  )
  .help('h')
  .alias('h', 'help')
  .alias('t', 'transpile')
  .alias('c', 'copy')
  .alias('g', 'generate-loader')
  .epilog('Remember. People love you!')
  .argv;

// Transpiling
function transpileShims (shims = DEFAULT_SHIMS_TO_TRANSPILE) {
  shims.forEach(filename => {
    const result = transformFileSync(filename, {
      presets: BABEL_ES5_PRESETS
    });
    const dst = join(dirname(filename), `${basename(filename, '.js')}.es5.js`);
    console.log(`Transpiling file to ES5:\n"${filename}" -> "${dst}"`);
    writeFileSync(dst, result.code, 'utf-8');
  });
}

// Copying
function copyShimsTo (toDir = DEFAULT_SHIMS_DEST, shimsToCopy = SHIMS_TO_COPY) {
  const baseDirname = shimsToCopy.reduce(
    (out, filename) =>
      dirname(filename)
        .split(sep)
        .filter((segment, ii) => out.split(sep).indexOf(segment) === ii)
        .join(sep),
    dirname(shimsToCopy[0])
  );

  mkdirp(toDir);

  shimsToCopy
    .map(filename => [
      filename,
      join(toDir, dirname(filename).replace(baseDirname, ''), basename(filename))
    ])
    .forEach(([srcFilename, dstFilename]) => {
      mkdirp(dirname(dstFilename));
      console.log(`Copying file: \n"${srcFilename}" -> "${dstFilename}"`);
      copyFileSync(srcFilename, dstFilename);
    });
}

// mkdir -p helper
function mkdirp (dir) {
  let prefix = dir[0] === sep ? sep : './'; // local/absolute path autodetection
  dir.split(sep).filter(Boolean).forEach((segment, ii, segments) => {
    try {
      mkdirSync(resolve(prefix, ...segments.slice(0, ii), segment));
    } catch (err) {
      if (err.code !== 'EEXIST') {
        console.log(`Unable to create directory to copy by error:`, err);
      }
    }
  });
}

function generateLoader (assetsBasePath, loaderCopyTo) {
  const writeTo = resolve(loaderCopyTo, basename(CUSTOM_ELEMENTS_SHIM_LOADER_SOURCE));

  let loaderContent;
  let loaderSrc;
  try {
    loaderSrc = resolve(dirname(require.resolve('@pe/ng-kit')), CUSTOM_ELEMENTS_SHIM_LOADER_SOURCE);
    loaderContent = readFileSync(loaderSrc, 'utf8');
  } catch (errModule) {
    try {
      loaderSrc = resolve('./', CUSTOM_ELEMENTS_SHIM_LOADER_SOURCE);
      loaderContent = readFileSync(loaderSrc, 'utf8');
    } catch (errLocal) {
      console.error(`Unable to read shims-loader sources with errors:`, '\n', errModule, '\n', errLocal);
      throw new Error('Unable to read shims-loader sources');
    }
  }
  loaderContent = loaderContent.replace(REPLACE_BASEDIR_TOKEN, assetsBasePath);

  try {
    mkdirp(dirname(writeTo));
    writeFileSync(writeTo, loaderContent, 'utf-8');
    console.log(`Successfully saved loader to ${writeTo}`);
  } catch (e) {
    console.error(`Unable to save custom elements shims loader to "${writeTo}" by error:`, e);
  }
}
