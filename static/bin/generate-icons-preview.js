#!/usr/bin/env node

const fse = require("fs-extra");
const path = require("path");
const minify = require("html-minifier").minify;
const parse = require("node-html-parser").parse;

const getFilesInPath = path => {
  return fse.readdirSync(path);
};

const imagesPath = path.join("./", "./icons");
const iconsFiles = getFilesInPath(imagesPath);

let htmlBody = "";

for (const iconFileName of iconsFiles) {
  if (iconFileName.indexOf(".html") < 0) continue;

  const iconName = iconFileName.replace(".html", "");

  let svgContent = fse.readFileSync(`./icons/${iconFileName}`, "utf-8");

  svgContent = minify(svgContent, {
    preserveLineBreaks: false,
    collapseWhitespace: true
  });
  const dom = parse(svgContent);
  const svgContnetSymbolsIds = dom
    .querySelectorAll("symbol")
    .reduce((acc, element) => {
      acc += `<svg style="height:100px;width:100px"><use xlink:href="#${
        element.id
      }" /></svg>\n`;
      return acc;
    }, "");

  htmlBody += `<h1>${iconName}</h1><div>${svgContent}${svgContnetSymbolsIds}</div>\n`;
}

const newIconsJsFilePath = `./dist/preview/index.html`;
const finalHTML = `
<!DOCTYPE html>
<html>
  <body style="background: #dddddd; overflow: auto;">
    ${htmlBody}
  </body>
</html>

`;
fse.createFileSync(newIconsJsFilePath);
fse.writeFile(newIconsJsFilePath, finalHTML, err => {
  if (err) {
    console.log(
      `Error with creation of a preview file generated ${iconName}, ${err}`
    );
  }
  console.log(`Icons preview file generated`);
});
