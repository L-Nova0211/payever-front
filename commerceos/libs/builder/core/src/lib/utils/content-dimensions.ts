class BoundingBox {
  left = Number.POSITIVE_INFINITY;
  right = Number.NEGATIVE_INFINITY;
  top = Number.POSITIVE_INFINITY;
  bottom = Number.NEGATIVE_INFINITY;
}

export interface ContentOverflow {
  getContentDimensions(): { width: number; height: number; };
}

export function implementsContentOverflow(elm: any): elm is ContentOverflow {
  return elm.getContentDimensions !== undefined;
}

export function getContentDimensions(elm: HTMLElement): { width: number; height: number; } {
  const elmRect = elm.getBoundingClientRect();
  const dimensions = walkDom(elm);
  let width = Math.max(...dimensions.map(r => r.right - r.left));
  const bottom = Math.max(...dimensions.map(r => r.bottom));
  const height = bottom - elmRect.top;

  /** Sometimes container's DOM rectangle are larger than it should be (chrome) */
  if (Math.floor(elmRect.width) === Math.ceil(width)) {
    width = elmRect.width;
  }

  return { width, height };
}

function walkDom(node, rectangles: BoundingBox[] = []): BoundingBox[] {
  if (node.nodeType === Node.ELEMENT_NODE && node.nodeName.match(/^p|div$/i)) {
    rectangles.push(new BoundingBox());
  } else {
    let rect: DOMRect;
    if (node.nodeType === Node.TEXT_NODE) {
      const range = document.createRange();
      range.selectNodeContents(node);
      rect = range.getBoundingClientRect();
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      rect = node.getBoundingClientRect();
    }

    if (rect) {
      let { left, top, right, bottom } = rectangles.pop() ?? new BoundingBox();

      left = Math.min(rect.left, left);
      top = Math.min(rect.top, top);
      right = Math.max(rect.right, right);
      bottom = Math.max(rect.bottom, bottom);

      rectangles.push({ left, top, right, bottom });
    }
  }

  let childNode = node.firstChild;
  while (childNode) {
    walkDom(childNode, rectangles);
    childNode = childNode.nextSibling;
  }

  return rectangles.filter(bbox => Object.values(bbox).filter(a => Number.isFinite(a)).length > 0);
}
