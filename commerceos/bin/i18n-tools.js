const path = require('path');
const https = require('https');
const fs = require('fs-extra');
const yargs = require('yargs');
const flatten = require('flat');

const frontDir = path.resolve('./');

// starting search points for monolyth
const appsSearchPaths = [
  path.resolve(frontDir, 'apps'),
  path.resolve(frontDir, 'apps-business'),
];

const domainPrefix = yargs.argv['domain-prefix'] || '';
const preparePath = yargs.argv['prepare-path'] || 'dist';
const outputPath = yargs.argv['output-path'] || './locales/dist';
const outputFormat = yargs.argv['format'] || 'json';

// @TODO remove after integrating environment configs everywhere
const host = process.env.I18N_HOST || 'translation-backend.test.devpayever.com';
const user = process.env.I18N_USER || 'client';
const pass = process.env.I18N_PASS || 'fyh4GDEuXXpagMaC';

console.log(`i18n-cli is working with host: ${host}`);

module.exports = {
  push: function (cleanup) {
    let paths = getTranslationPaths(frontDir);
    if (paths.length) {
      console.log('Found following translation files:\n', paths.join("\n"));
      for (let transPath of paths) {
        let transJson;
        try {
          transJson = fs.readJsonSync(transPath);
        } catch(e) {
          throw new Error(`Could not parse json from path: ${transPath}`.red);
        }
        let plainTranslations = {};
        flattenTransNode(transJson, plainTranslations, '');
        pushUnits(plainTranslations, getDomainName(transPath), cleanup);
      }
    } else {
      console.log('No translations files found.');
    }
  },
  prepare: function () {
    let paths = getTranslationPaths(frontDir);
    if (paths.length) {
      for (let transPath of paths) {
        console.log(`Processing translation file '${transPath}'`);
        let transJson;
        try {
          transJson = fs.readJsonSync(transPath);
        } catch(e) {
          throw new Error(`Could not parse file '${transPath}'`.red);
        }
        let plainTranslations = {};
        flattenTransNode(transJson, plainTranslations, '');

        const domain = getDomainName(transPath);
        writePushData(plainTranslations, domain, preparePath);
      }
    } else {
      console.log('No translations files found.');
    }
  },
  flatten: function(inputFile, outputFile) {
    if (!inputFile) throw new Error('input file argument required');
    if (!outputFile) throw new Error('output file argument required');
    if (!fs.existsSync(inputFile)) throw new Error('input file does not exist');

    fs.mkdirpSync(path.dirname(outputFile));

    let content;

    try {
      content = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    } catch (e) {
      throw new Error(`Error occured while parsing json file ${inputFile}: e`);
    }

    try {
      fs.writeFileSync(outputFile, JSON.stringify(flatten(content)));
    } catch (e) {
      throw new Error(`Could not write output file: ${outputFile}: e`);
    }
  },
};

function getTranslationPaths() {
  let paths = [].concat(
    extractMicroServiceTranslationPaths(frontDir),
    extractAppsTranslationPaths(frontDir)
  );
  // We don't extract from all NPM repos, it just has not sense.
  // extractNpmTranslationPaths(frontDir, paths);
  extractNgKitTranslationPaths(frontDir, paths);
  return paths;
}

function flattenTransNode(node, storage, keyPrefix) {
  let result = {};
  for (let key in node) {
    let newKey = keyPrefix ? keyPrefix + '.' + key : key;
    if (typeof node[key] === 'object') {
      flattenTransNode(node[key], storage, newKey);
    } else {
      storage[newKey] = node[key];
    }
  }
}

function getDomainName(file) {
  let hub = ~file.indexOf('node_modules')
    ? `-${path.basename(path.resolve(file, "../../../"))}`
    : (domainPrefix ? `-${domainPrefix}` : '');
  return `frontend${hub}-${path.basename(file, '.json')}`;
}

function extractMicroServiceTranslationPaths(startDir) {
  // searching only root folder
  return extractModuleTranslationPaths(startDir);
}

function extractAppsTranslationPaths(startDir) {
  let paths = [];
  appsSearchPaths.map((appsFolder) => {
    let appsPath = path.resolve(startDir, appsFolder);
    if (fs.existsSync(appsPath)) {
      fs.readdirSync(appsPath).map((appEntry) => {
        paths = paths.concat(extractModuleTranslationPaths(path.resolve(appsPath, appEntry)));
      });
    }
  });
  return paths;
}

function extractNpmTranslationPaths(startDir, transPaths) {
  const pePath = path.resolve(startDir, "./node_modules/@pe");
  if (fs.existsSync(pePath)) {
    let packages = fs.readdirSync(pePath);
    for (let pack of packages) {
      let packPath = path.resolve(pePath, pack);
      extractModuleTranslationPaths(packPath).map((moduleTransPath) => {
        transPaths.push(moduleTransPath);
      });
      extractNpmTranslationPaths(packPath, transPaths);
    }
  }
  return;
}

function extractNgKitTranslationPaths(startDir, transPaths) {
  const pePath = path.resolve(startDir, "./node_modules/@pe/ng-kit");
  if (fs.existsSync(pePath)) {
    let packages = fs.readdirSync(pePath);
    for (let pack of packages) {
      let packPath = path.resolve(pePath, pack);
      extractModuleTranslationPaths(packPath).map((moduleTransPath) => {
        transPaths.push(moduleTransPath);
      });
      extractNgKitTranslationPaths(packPath, transPaths);
    }
  }
  return;
}

function extractModuleTranslationPaths(moduleDir) {
  const transPath = path.resolve(moduleDir, "assets/locale");
  if (fs.existsSync(transPath)) {
    return fs.readdirSync(transPath).map((transFile) => {
      return path.resolve(moduleDir, transPath, transFile);
    });
  }
  return [];
}

function processDomain(lang, domain, units) {
  domain = domain.replace(/^frontend-/, '');
  let fileContent;
  let filePath;
  let i18nObject = {};

  for (let unit of units) {
    i18nObject[unit.key] = unit.content;
  }

  switch (outputFormat) {
    case 'json':
      fileContent = JSON.stringify(i18nObject);
      filePath = path.resolve(frontDir, outputPath, `${lang}/${domain}.${outputFormat}`);
      break;
    case 'js':
      const varName = `i18n_${domain.replace(/-/g, '_')}`;
      fileContent = `var ${varName} = ${JSON.stringify(i18nObject)}`;
      filePath = path.resolve(frontDir, outputPath, `${lang}/${varName}.${outputFormat}`);
      break;
    default:
      throw `Unknown output format ${outputFormat}`;
  }

  fs.outputFileSync(filePath, fileContent);
  console.log(`Translations for domain '${domain}' and lang '${lang}' saved to file: '${filePath}'`.green);
}

function pushUnits(transJson, domain, cleanup) {
  let postData = JSON.stringify(transJson);
  let options = getRequestOptions({
    method: 'POST',
    path: `/api/translation/${domain}-en`,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  });

  console.log(`Posting translations for domain '${domain}'...`);

  let req = https.request(options, (res) => {
    switch (res.statusCode) {
      case 200:
      case 201:
        console.log(`Translations for domain '${domain}' successfully posted.`.green);

        res.on("data", function(chunk) {
          console.log(chunk.toString());
        });

        break;
      case 400:
        throw new Error(`Translations for domain '${domain}' NOT posted - Incorrect input data.`.red);
      case 401:
      case 403:
        throw new Error(`Translations for domain '${domain}' NOT posted - Access denied`.red);
      default:
        throw new Error(`Translations for domain '${domain}' NOT posted - Unexpected status code: ${res.statusCode}`.red);
    }
  });

  req.write(postData);
}

function writePushData(data, domain, outputDir) {
  fs.mkdirpSync(outputDir);
  const outputFile = `${outputDir}/${domain}-en.json`;
  fs.writeFileSync(outputFile, JSON.stringify(data));
  console.log(`Translations for domain '${domain}' prepared in '${outputFile}'.`.green);
}

function getRequestOptions(userOptions) {
  const baseOptions = {
    hostname: host,
    port: 443,
    auth: user + ':' + pass,
  };
  return Object.assign({}, baseOptions, userOptions);
}
