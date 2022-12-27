#!/usr/bin/env node

/*
 * Read all html files form "icons" folder. Get their content, insert into pe-icons-loader-template.js and generate new
 * js file for each html. Place all new files into ./dist/icons-js folder
 * */

const fse = require('fs-extra');
const path = require('path');
const minify = require('html-minifier').minify;
const babel = require('babel-core');

const getFilesInPath = (path) => {
  return fse.readdirSync(path);
};

const imagesPath = path.join('./', './icons');
const iconsFiles = getFilesInPath(imagesPath);
const jsTemplateString = fse.readFileSync('./js/pe-icons-loader-template.js', 'utf-8');

for (const iconFileName of iconsFiles) {

  if (iconFileName.indexOf('.html') < 0) continue;

  const iconName = iconFileName.replace('.html', '');
  const jsIconFileName = `pe-${iconName}.js`;

  let svgContent = fse.readFileSync(`./icons/${iconFileName}`, 'utf-8');

  svgContent = minify(svgContent, {
    preserveLineBreaks: false,
    collapseWhitespace: true
  });

  const jsTemplateClone = jsTemplateString;
  const newJsIconLoaderString = jsTemplateClone.replace('%%html%%', svgContent);

  // Transpile script to make it compatible with IE11
  const transpiledCode = babel.transform(newJsIconLoaderString, {
    presets: ['es2015']
  });

  const newIconsJsFilePath = `./dist/icons-js/${jsIconFileName}`;
  fse.createFileSync(newIconsJsFilePath);
  fse.writeFile(newIconsJsFilePath, transpiledCode.code, err => {
    if (err) {
      console.log(`Error with icons js file generated ${iconName}, ${err}`);
    }
    console.log(`Icons js file generated ${iconName}`);
  })

}
