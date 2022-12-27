export function cleanUpHtml(value: string): string {
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(value, 'text/html');
  htmlDoc.querySelectorAll('img').forEach((n) => {
    const parent = n.parentNode;
    parent.removeChild(n);
    if (parent.childElementCount === 0) {
      parent.parentNode.removeChild(parent);
    }
  });

  const walker = htmlDoc.createTreeWalker(
    htmlDoc,
    NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_CDATA_SECTION,
    null,
  );
  const nodes = [];
  let comment;
  while (comment = walker.nextNode()) {
    nodes.push(comment);
  }

  nodes.forEach((n) => {
    n.parentNode.removeChild(n);
  });

  return unescape(htmlDoc.documentElement.outerHTML)
    .replace(/<br>|<\/div><div>/gi, '\n')
    .replace(/(<([^>]+)>)/gi, '')
    .replace(/\\n/gi, '\n')
    .replace(/\n\n/gi, '\n');
}
