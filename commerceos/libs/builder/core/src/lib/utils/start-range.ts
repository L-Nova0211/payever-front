export function getStartRange(node: any, scale: number, x: number, y: number): number {
  const documentRect = getDocumentRect(node);
  const nodeRects = getNodeRects(node, documentRect, scale);
  const intersectingNodeRects = getIntersectingNodeRects(nodeRects, y, 0, nodeRects.length - 1)
  const correctCoordinate = getCorrectCoordinate(intersectingNodeRects, x, y);

  let nodeIndex = 0;
  let startRange = 0;

  intersectingNodeRects.forEach(nodeRect => {
    const charIndex = getCharIndex(
      nodeRect.node,
      nodeRect.endOffset,
      correctCoordinate.x,
      correctCoordinate.y,
      documentRect,
      scale,
      correctCoordinate.x !== x,
    );

    if (charIndex !== undefined) {
      nodeIndex = nodeRect.index;
      startRange = charIndex;
    }
  });

  nodeRects.forEach((nodeRect, i) => {
    if (i < nodeIndex) {
      startRange = startRange + nodeRect.endOffset;
    }
  });

  return startRange;
}


function recalculateRect(rect: DOMRect, documentRect: DOMRect, scale: number): DOMRect {
  return {
    x: (rect.x - documentRect.x + window.scrollX) / scale,
    y: (rect.y - documentRect.y + window.scrollY) / scale,
    width: rect.width / scale,
    height: rect.height / scale,
    top: (rect.top - documentRect.top + window.scrollY) / scale,
    right: (rect.right - documentRect.left + window.scrollX) / scale,
    bottom: (rect.bottom - documentRect.top + window.scrollY) / scale,
    left: (rect.left - documentRect.left + window.scrollX) / scale,
  } as DOMRect;
}

function getDocumentRect(node: any): DOMRect {
  return node.nodeName === 'PEB-ELEMENT-DOCUMENT'
    ? node.getBoundingClientRect()
    : getDocumentRect(node.parentNode);
}

function getNodeRects(
  node: any,
  documentRect: DOMRect,
  scale: number,
  rects: any[] = [],
): any[] {
  if (!node.nodeName.match(/^p|div$/i)) {
    let rect;

    if (node.nodeType === Node.TEXT_NODE) {
      const range = document.createRange();

      range.selectNodeContents(node);
      rect = range.getBoundingClientRect();
      rect.endOffset = isLastInParagraph(node) ? range.endOffset + 1 : range.endOffset;
    } else if (node.nodeName === 'BR') {
      rect = node.getBoundingClientRect();
      rect.endOffset = isLastInParagraph(node) ? 1 : 0;
    }

    if (rect) {
      rects.push({
        ...recalculateRect(rect, documentRect, scale),
        endOffset: rect.endOffset,
        index: rects.length,
        node: node,
      });
    }
  }

  let childNode = node.firstChild;

  while (childNode) {
    getNodeRects(childNode, documentRect, scale, rects);
    childNode = childNode.nextSibling;
  }

  return rects;
}

function getIntersectingNodeRects(nodes: any[], top: number, start: number, end: number): any[] {
  if (end < 1) {
    return [nodes[0]];
  }

  const middle = Math.floor((start + (end - start) / 2));

  if (top > nodes[middle].top && top < nodes[middle].bottom) {
    return nodes.filter(node => top > node.top && top < node.bottom);
  }

  if (end - 1 === start) {
    const absStartTop = Math.abs(nodes[start].top - top);
    const absEndTop = Math.abs(nodes[end].top - top);

    if (absStartTop > absEndTop) {
      return [nodes[end]];
    }

    if (absStartTop < absEndTop) {
      return [nodes[start]];
    }

    if (absStartTop === absEndTop) {
      return [nodes[start], nodes[end]];
    }
  }

  if (top < nodes[middle].top) {
    return getIntersectingNodeRects(nodes, top, start, middle);
  }

  if (top > nodes[middle].bottom) {
    return getIntersectingNodeRects(nodes, top, middle, end);
  }
}

function getCorrectCoordinate(rects: any[], left: number, top: number): { x: number, y: number } {
  const max = {
    top: rects.reduce((prev, curr) => prev.top < curr.top ? prev : curr).top,
    right: rects.reduce((prev, curr) => prev.right > curr.right ? prev : curr).right,
    bottom: rects.reduce((prev, curr) => prev.bottom > curr.bottom ? prev : curr).bottom,
    left: rects.reduce((prev, curr) => prev.left < curr.left ? prev : curr).left,
  };

  let x = left;
  let y = top;

  if (x < max.left) { x = max.left }
  if (x > max.right) { x = max.right }
  if (y < max.top) { y = max.top }
  if (y > max.bottom) { y = max.bottom }

  return { x, y };
}

function getCharIndex(
  node: any,
  endOffset: number,
  x: number,
  y: number,
  documentRect: DOMRect,
  scale: number,
  corrected: boolean,
): number {
  let range = document.createRange();

  let charIndex;

  if (endOffset === 1) {
    range.setStart(node, 0);
    range.setEnd(node, 0);

    charIndex = 0;
  }

  let i = 0;
  let charRects = [];

  while (i < node.length) {
    range.setStart(node, i);
    range.setEnd(node, endOffset === 1 ? i : i + 1);

    const rect = recalculateRect(range.getBoundingClientRect(), documentRect, scale);

    charRects.push({ ...rect, index: i });

    if ((y >= rect.top && y <= rect.bottom) && (x >= rect.left && x <= rect.right)) {
      if (x <= (rect.left + rect.width / 2)) {
        charIndex = i;
      }
      if (x > (rect.right - rect.width / 2)) {
        charIndex = corrected ? i : i + 1;
      }
    }

    i = i + 1;
  }

  if (charIndex === undefined) {
    const line = charRects.filter(rect => rect.top < y && rect.bottom > y);

    if (line.length) {
      const maxRight = line.reduce((prev, curr) => prev.right > curr.right ? prev : curr);
      const minLeft = line.reduce((prev, curr) => prev.left < curr.left ? prev : curr);

      if (x > minLeft.left && x > maxRight.right) {
        charIndex = maxRight.index + 1;
      }

      if (x < minLeft.left && x < maxRight.right) {
        charIndex = minLeft.index;
      }
    }
  }

  return charIndex;
}

function isLastInParagraph(node: any): any {
  let parentNode = node.parentNode;

  if (parentNode.nodeName === 'P') {
    return node.nextSibling === null;
  } else {
    return isLastInParagraph(parentNode);
  }
}
