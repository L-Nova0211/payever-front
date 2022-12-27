import { isEqual, uniqWith } from 'lodash';
import RBush, { BBox } from 'rbush';

import {
  PebElementDef,
  pebFilterElementsDeep,
  pebScreenContentWidthList,
  PebThemePageInterface,
} from '@pe/builder-core';
// import { PebEditorElement, PebEditorRenderer } from '@pe/builder-main-renderer';
import { PebDOMRect } from '@pe/builder-old';


const MAGNETIZING_THRESHOLD = 9;

export interface Movement {
  dx: number;
  dy: number;
}

export enum GuidelinePosition {
  Left = 'left',
  Right = 'right',
  Top = 'top',
  Bottom = 'bottom',
  Center = 'center',
  Middle = 'middle',
}


export function createGuidelinesRTree(
  renderer: any, // PebEditorRenderer
  elementIds: string[],
  elementRect: PebDOMRect,
  sectionsRTree: RBush<BBox>,
): RBush<BBox> {

  const threshold = getMagnetizingThreshold(renderer, elementRect);

  const tree = new RBush<BBox>();

  const sectionDefs = getParentSection(renderer, sectionsRTree, elementIds);
  // const sectionRect = getGeneralRect(renderer, sectionDefs);

  const { screen } = renderer.options;
  const screenList = pebScreenContentWidthList;

  const elements = elementIds.reduce((acc, curr) => {
    return [
      ...acc,
      ...pebFilterElementsDeep(renderer.getElementComponent(curr).definition),
    ];
  }, []);

  const ignoreIds = [
    ...elementIds,
    ...(elements?.length ? elements.map(child => child.id) : []),
  ];

  const items = sectionDefs.reduce((acc, sectionDef) => {
    return [...acc, ...pebFilterElementsDeep(sectionDef), sectionDef];
  }, []).reduce((acc, el) => {
    if (ignoreIds.find(id => id === el.id)) {
      return acc;
    }

    const element = renderer.getElementComponent(el.id);

    // if (element) {
    //   const rect = element.getAbsoluteElementRect();
    //
    //   acc.push(
    //     {
    //       elementRect: rect,
    //       minX: (el.type === PebElementType.Section ? 0 : sectionRect.left),
    //       minY: rect.top - threshold,
    //       maxX: (el.type === PebElementType.Section ? screenList[screen] : sectionRect.right),
    //       maxY: rect.top + threshold,
    //     },
    //     {
    //       elementRect: rect,
    //       minX: (el.type === PebElementType.Section ? 0 : sectionRect.left),
    //       minY: rect.top + (rect.height / 2) - threshold,
    //       maxX: (el.type === PebElementType.Section ? screenList[screen] : sectionRect.right),
    //       maxY: rect.top + (rect.height / 2) + threshold,
    //     },
    //     {
    //       elementRect: rect,
    //       minX: (el.type === PebElementType.Section ? 0 : sectionRect.left),
    //       minY: rect.bottom - threshold,
    //       maxX: (el.type === PebElementType.Section ? screenList[screen] : sectionRect.right),
    //       maxY: rect.bottom + threshold,
    //     },
    //     {
    //       elementRect: rect,
    //       minX: (el.type === PebElementType.Section ? 0 : rect.left) - threshold,
    //       minY: sectionRect.top,
    //       maxX: (el.type === PebElementType.Section ? 0 : rect.left) + threshold,
    //       maxY: sectionRect.bottom,
    //     },
    //     {
    //       elementRect: rect,
    //       minX: rect.left + (rect.width / 2) - threshold,
    //       minY: sectionRect.top,
    //       maxX: rect.left + (rect.width / 2) + threshold,
    //       maxY: sectionRect.bottom,
    //     },
    //     {
    //       elementRect: rect,
    //       minX: (el.type === PebElementType.Section ? screenList[screen] : rect.right) - threshold,
    //       minY: sectionRect.top,
    //       maxX: (el.type === PebElementType.Section ? screenList[screen] : rect.right) + threshold,
    //       maxY: sectionRect.bottom,
    //     },
    //   );
    // }

    return acc;
  }, []);

  tree.load(items);

  return tree;
}

export function createDistancesGuidelinesRTree(
  renderer: any, // PebEditorRenderer
  elementIds: string[],
  currentRect: PebDOMRect,
  parentElements?: any[], // PebEditorElement
): RBush<BBox> {

  const tree = new RBush<BBox>();

  if (!parent) {
    return tree;
  }

  const elementDefs = parentElements.reduce((acc, curr) => {
    return [
      ...acc,
      ...pebFilterElementsDeep(curr.definition),
    ];
  }, []).filter(element => elementIds.findIndex(id => element.id === id) === -1);

  const items = elementDefs.reduce((acc, el) => {

    const element = renderer.getElementComponent(el.id);
    // const elementRect = element?.getAbsoluteElementRect();

    // if (!elementRect) {
    //   return acc;
    // }

    return [
      ...acc,
      {
        // minX: elementRect.left,
        // minY: elementRect.top,
        // maxX: elementRect.right,
        // maxY: elementRect.bottom,
      },
    ];
  }, [{
    minX: currentRect.left,
    minY: currentRect.top,
    maxX: currentRect.right,
    maxY: currentRect.bottom,
  }]);

  tree.load(items);

  return tree;
}

export function getGuidelines(
  renderer: any, // PebEditorRenderer
  tree: RBush<BBox>,
  parentRect: PebDOMRect,
  currentRect: PebDOMRect,
  nextRect?: PebDOMRect,
) {

  const elementRect = nextRect ? nextRect : currentRect;

  const threshold = getMagnetizingThreshold(renderer, elementRect);

  const guidelines: any = {
    left: getLine(tree.search({
      minX: elementRect.left,
      minY: parentRect.top,
      maxX: elementRect.left,
      maxY: parentRect.bottom,
    }).filter((value: BBox) => {
      return (value.minX + threshold === value.maxX - threshold)
        && (elementRect.left > value.minX && elementRect.left < value.maxX);
    })),
    center: getLine(tree.search({
      minX: elementRect.left + (elementRect.width / 2),
      minY: parentRect.top,
      maxX: elementRect.left + (elementRect.width / 2),
      maxY: parentRect.bottom,
    }).filter((value: BBox) => {
      return (value.minX + threshold === value.maxX - threshold)
        && (elementRect.left + (elementRect.width / 2) > value.minX
          && elementRect.left + (elementRect.width / 2) < value.maxX);
    })),
    right: getLine(tree.search({
      minX: elementRect.right,
      minY: parentRect.top,
      maxX: elementRect.right,
      maxY: parentRect.bottom,
    }).filter((value: BBox) => {
      return (value.minX + threshold === value.maxX - threshold)
        && (elementRect.right > value.minX && elementRect.right < value.maxX);
    })),
    top: getLine(tree.search({
      minX: parentRect.left,
      minY: elementRect.top,
      maxX: parentRect.right,
      maxY: elementRect.top,
    }).filter((value: BBox) => {
      return (value.minY + threshold === value.maxY - threshold)
        && (elementRect.top > value.minY && elementRect.top < value.maxY);
    })),
    middle: getLine(tree.search({
      minX: parentRect.left,
      minY: elementRect.top + (elementRect.height / 2),
      maxX: parentRect.right,
      maxY: elementRect.top + (elementRect.height / 2),
    }).filter((value: BBox) => {
      return (value.minY + threshold === value.maxY - threshold)
        && (elementRect.top + (elementRect.height / 2) > value.minY
          && elementRect.top + (elementRect.height / 2) < value.maxY);
    })),
    bottom: getLine(tree.search({
      minX: parentRect.left,
      minY: elementRect.bottom,
      maxX: parentRect.right,
      maxY: elementRect.bottom,
    }).filter((value: BBox) => {
      return (value.minY + threshold === value.maxY - threshold)
        && (elementRect.bottom > value.minY && elementRect.bottom < value.maxY);
    })),
  };

  if (!nextRect) {
    if (guidelines.center) {
      let center = currentRect.left + (currentRect.width / 2);

      const lineIsInteger = Number.isInteger(guidelines.center.minX);
      const centerIsInteger = Number.isInteger(center);

      if (!centerIsInteger && lineIsInteger) {
        center = Math.floor(center);
      }

      if (centerIsInteger && !lineIsInteger) {
        guidelines.center.minX = Math.ceil(guidelines.center.minX);
        guidelines.center.maxX = Math.ceil(guidelines.center.maxX);
      }

      guidelines.center = Math.abs((guidelines.right?.minX - guidelines.left?.minX) - currentRect.width) === 1
        ? null
        : guidelines.center.minX === center ? guidelines.center : null;
    }

    if (guidelines.middle) {
      let middle = currentRect.top + (currentRect.height / 2);

      const lineIsInteger = Number.isInteger(guidelines.middle.minY);
      const middleIsInteger = Number.isInteger(middle);

      if (!middleIsInteger && lineIsInteger) {
        middle = Math.floor(middle);
      }

      if (middleIsInteger && !lineIsInteger) {
        guidelines.middle.minY = Math.ceil(guidelines.middle.minY);
        guidelines.middle.maxY = Math.ceil(guidelines.middle.maxY);
      }

      guidelines.middle = Math.abs((guidelines.bottom?.minY - guidelines.top?.minY) - currentRect.height) === 1
        ? null
        : guidelines.middle.minY === middle ? guidelines.middle : null;
    }

    guidelines.left = Math.ceil(guidelines.left?.minX) === currentRect.left ? guidelines.left : null;
    guidelines.right = Math.ceil(guidelines.right?.maxX) === currentRect.right ? guidelines.right : null;
    guidelines.top = Math.ceil(guidelines.top?.minY) === currentRect.top ? guidelines.top : null;
    guidelines.bottom = Math.ceil(guidelines.bottom?.maxY) === currentRect.bottom ? guidelines.bottom : null;
  }

  if (guidelines.left) {guidelines.left.position = GuidelinePosition.Left;}
  if (guidelines.top) {guidelines.top.position = GuidelinePosition.Top;}
  if (guidelines.right) {guidelines.right.position = GuidelinePosition.Right;}
  if (guidelines.bottom) {guidelines.bottom.position = GuidelinePosition.Bottom;}

  return guidelines;

  function getLine(lines, top = false) {
    if (!lines.length) {
      return null;
    }

    lines.unshift({
      elementRect,
      minX: elementRect.left,
      minY: elementRect.top,
      maxX: elementRect.right,
      maxY: elementRect.bottom,
    });

    return lines.reduce((prev, curr) => {
      return {
        minX: curr.minX + threshold === curr.maxX - threshold
          ? curr.minX + threshold
          : Math.min(...lines.map(obj => obj.elementRect.left)),
        minY: curr.minY + threshold === curr.maxY - threshold
          ? curr.minY + threshold
          : Math.min(...lines.map(obj => obj.elementRect.top)),
        maxX: curr.minX + threshold === curr.maxX - threshold
          ? curr.maxX - threshold
          : Math.max(...lines.map(obj => obj.elementRect.right)),
        maxY: curr.minY + threshold === curr.maxY - threshold
          ? curr.maxY - threshold
          : Math.max(...lines.map(obj => obj.elementRect.bottom)),
      };
    });
  }
}

export function getMagnetizedGuidelines(
  renderer: any, // PebEditorRenderer
  tree: RBush<BBox>,
  parentRect: PebDOMRect,
  initialRect: PebDOMRect,
  currentRect: PebDOMRect,
  movement: Movement,
  newRect?: PebDOMRect,
) {

  const nextPosition = {
    x: initialRect.left + movement.dx,
    y: initialRect.top + movement.dy,
  };

  const nextRect: PebDOMRect = newRect ? newRect : {
    ...initialRect,
    width: initialRect.width,
    height: initialRect.height,
    top: nextPosition.y,
    right: (nextPosition.x + initialRect.width),
    bottom: (nextPosition.y + initialRect.height),
    left: nextPosition.x,
  };

  const guidelines = getGuidelines(renderer, tree, parentRect, currentRect, nextRect) as any;
  const movementCandidates = getMovementCandidates(guidelines, movement, nextRect);

  return movementCandidates;
}

export function getDistancesGuidelines(
  renderer: any, // PebEditorRenderer
  elementIds: string[],
  currentRect: PebDOMRect,
  parentRect: PebDOMRect,
  sectionRTree: RBush<BBox>,
  initialCoords?: PebDOMRect,
  movement?: Movement,
) {

  const threshold = getMagnetizingThreshold(renderer, currentRect);

  let guidelines = [];

  let dx: number;
  let dy: number;

  const parentDefs = getParentSection(renderer, sectionRTree, elementIds);
  const parentElements = parentDefs.map(parent => renderer.getElementComponent(parent.id));

  const tree = createDistancesGuidelinesRTree(renderer, elementIds, currentRect, parentElements);

  const children = parentDefs.reduce((acc, curr) => [...acc, ...curr.children], [])
    .map((child => renderer.getElementComponent(child.id)));

  children.forEach((child: any) => { // PebEditorElement
    const childComponent = renderer.getElementComponent(child.definition.id);
    // const childRect = childComponent?.getAbsoluteElementRect();

    // if (!childRect) {
    //   return;
    // }

    // const siblings = {
    //   left: tree.search({
    //     minX: parentRect.left,
    //     minY: childRect.top,
    //     maxX: childRect.left - 1,
    //     maxY: childRect.bottom,
    //   }).map((siblingBBox) => {
    //     const minY = childRect.top > siblingBBox.minY ? childRect.top : siblingBBox.minY;
    //     const maxY = childRect.bottom < siblingBBox.maxY ? childRect.bottom : siblingBBox.maxY;
    //
    //     return {
    //       minX: siblingBBox.maxX,
    //       minY: minY + ((maxY - minY) / 2),
    //       maxX: childRect.left,
    //       maxY: minY + ((maxY - minY) / 2),
    //       width: childRect.left - siblingBBox.maxX,
    //       isDimension: true,
    //     };
    //   }),
    //   top: tree.search({
    //     minX: childRect.left,
    //     minY: parentRect.top,
    //     maxX: childRect.right,
    //     maxY: childRect.top - 1,
    //   }).map((siblingBBox) => {
    //     const minX = childRect.left > siblingBBox.minX ? childRect.left : siblingBBox.minX;
    //     const maxX = childRect.right < siblingBBox.maxX ? childRect.right : siblingBBox.maxX;
    //
    //     return {
    //       minX: minX + ((maxX - minX) / 2),
    //       minY: siblingBBox.maxY,
    //       maxX: minX + ((maxX - minX) / 2),
    //       maxY: childRect.top,
    //       height: childRect.top - siblingBBox.maxY,
    //       isDimension: true,
    //     };
    //   }),
    //   right: tree.search({
    //     minX: childRect.right + 1,
    //     minY: childRect.top,
    //     maxX: parentRect.right,
    //     maxY: childRect.bottom,
    //   }).map((siblingBBox) => {
    //     const minY = childRect.top > siblingBBox.minY ? childRect.top : siblingBBox.minY;
    //     const maxY = childRect.bottom < siblingBBox.maxY ? childRect.bottom : siblingBBox.maxY;
    //
    //     return {
    //       minX: childRect.right,
    //       minY: minY + ((maxY - minY) / 2),
    //       maxX: siblingBBox.minX,
    //       maxY: minY + ((maxY - minY) / 2),
    //       width: siblingBBox.minX - childRect.right,
    //       isDimension: true,
    //     };
    //   }),
    //   bottom: tree.search({
    //     minX: childRect.left,
    //     minY: childRect.bottom + 1,
    //     maxX: childRect.right,
    //     maxY: parentRect.bottom,
    //   }).map((siblingBBox) => {
    //     const minX = childRect.left > siblingBBox.minX ? childRect.left : siblingBBox.minX;
    //     const maxX = childRect.right < siblingBBox.maxX ? childRect.right : siblingBBox.maxX;
    //
    //     return {
    //       minX: minX + ((maxX - minX) / 2),
    //       minY: childRect.bottom,
    //       maxX: minX + ((maxX - minX) / 2),
    //       maxY: siblingBBox.minY,
    //       height: siblingBBox.minY - childRect.bottom,
    //       isDimension: true,
    //     };
    //   }),
    // };

    // const distances = {
    //   left: siblings.left.filter(l => siblings.right.some((r) => {
    //     if (movement) {
    //       if (Math.abs(initialCoords.left + movement.dx - (r.minX + l.width)) < threshold) {
    //         dx = (r.minX + l.width) - initialCoords.left;
    //       }
    //       if (Math.abs(initialCoords.left + movement.dx - (l.minX + (l.width + r.width) / 2)) < threshold) {
    //         dx = l.minX + (l.width + r.width) / 2 - initialCoords.left;
    //       }
    //     }
    //
    //     r.width = Math.abs(r.width - l.width) === 1 ? l.width = (l.width + r.width) / 2 : r.width;
    //
    //     return r.width === l.width;
    //   })),
    //   top: siblings.top.filter(t => siblings.bottom.some((b) => {
    //     if (movement) {
    //       if (Math.abs(initialCoords.top + movement.dy - (b.minY + t.height)) < threshold) {
    //         dy = (b.minY + t.height) - initialCoords.top;
    //       }
    //       if (Math.abs(initialCoords.top + movement.dy - (t.minY + (t.height + b.height) / 2)) < threshold) {
    //         dy = t.minY + (t.height + b.height) / 2 - initialCoords.top;
    //       }
    //     }
    //
    //     b.height = Math.abs(b.height - t.height) === 1 ? t.height = (t.height + b.height) / 2 : b.height;
    //
    //     return b.height === t.height;
    //   })),
    //   right: siblings.right.filter(r => siblings.left.some((l) => {
    //     if (movement) {
    //       if (Math.abs(initialCoords.right + movement.dx - (l.maxX - r.width)) < threshold) {
    //         dx = (l.maxX - r.width) - initialCoords.right;
    //       }
    //     }
    //
    //     r.width = Math.abs(r.width - l.width) === 1 ? l.width = (l.width + r.width) / 2 : r.width;
    //
    //     return l.width === r.width;
    //   })),
    //   bottom: siblings.bottom.filter(b => siblings.top.some((t) => {
    //     if (movement) {
    //       if (Math.abs(initialCoords.bottom + movement.dy - (t.maxY - b.height)) < threshold) {
    //         dy = (t.maxY - b.height) - initialCoords.bottom;
    //       }
    //     }
    //
    //     b.height = Math.abs(b.height - t.height) === 1 ? t.height = (t.height + b.height) / 2 : b.height;
    //
    //     return t.height === b.height;
    //   })),
    // };

    // if (distances.left.length && distances.right.length) {
    //   guidelines = [
    //     ...guidelines,
    //     ...distances.left,
    //     ...distances.right,
    //   ];
    // }
    //
    // if (distances.top.length && distances.bottom.length) {
    //   guidelines = [
    //     ...guidelines,
    //     ...distances.top,
    //     ...distances.bottom,
    //   ];
    // }
  });

  guidelines = uniqWith([
    ...guidelines.filter((v, i, a) => a.findIndex(t => (t.minX === v.minX && t.maxX === v.maxX)) === i),
    ...guidelines.filter((v, i, a) => a.findIndex(t => (t.minY === v.minY && t.maxY === v.maxY)) === i),
  ], isEqual);

  let filteredLines = [];

  const horizontalLines = guidelines.filter((value: any) => {
    return (value.maxX === currentRect.left || value.minX === currentRect.right)
      && (value.minY > currentRect.top && value.maxY < currentRect.bottom);
  });

  if (horizontalLines.length) {
    const minWidth = horizontalLines.reduce((prev, curr) => prev.width < curr.width ? prev : curr).width;

    filteredLines = [...filteredLines, ...guidelines.filter(value => value.width === minWidth)];

    const vLines = guidelines.filter(value => value.maxY === currentRect.top || value.minY === currentRect.bottom);
    if (vLines.length) {
      const vertical = guidelines.filter(value => value.minX > currentRect.left && value.maxX < currentRect.right);
      if (vertical.length > 1) {
        const minHeight = vertical.reduce((prev, curr) => prev.height < curr.height ? prev : curr).height;

        filteredLines = [...filteredLines, ...vertical.filter(value => value.height === minHeight)];
      }
    }
  }

  const verticalLines = guidelines.filter((value: any) => {
    return (value.maxY === currentRect.top || value.minY === currentRect.bottom)
      && (value.minX > currentRect.left && value.maxX < currentRect.right);
  });

  if (verticalLines.length) {
    const minHeight = verticalLines.reduce((prev, curr) => prev.height < curr.height ? prev : curr).height;

    filteredLines = [...filteredLines, ...guidelines.filter(value => value.height === minHeight)];

    const hLines = guidelines.filter(value => value.maxX === currentRect.left || value.minX === currentRect.right);
    if (hLines.length) {
      const horizontal = guidelines.filter(value => value.minY > currentRect.top && value.maxY < currentRect.bottom);
      if (horizontal.length > 1) {
        const minWidth = horizontal.reduce((prev, curr) => prev.width < curr.width ? prev : curr).width;

        filteredLines = [...filteredLines, ...horizontal.filter(value => value.width === minWidth)];
      }
    }
  }

  return movement
    ? { left: typeof dx === 'number' ? { dx } : undefined, top: typeof dy === 'number' ? { dy } : undefined }
    : filteredLines;
}

export function getParentSection(
  renderer: any,  // PebEditorRenderer
  tree: RBush<BBox>,
  elementIds: string[],
): PebElementDef[] {
  const coords = elementIds.reduce((acc, elementId: string) => {
    const cmp = renderer.getElementComponent(elementId);
    if (cmp) {
      acc.push(cmp.nativeElement.getBoundingClientRect());
    }

    return acc;
  }, []);

  const elementRect = {
    left: Math.min(...coords.map(coord => coord.left)),
    right: Math.max(...coords.map(coord => coord.right)),
    top: Math.min(...coords.map(coord => coord.top)),
    bottom: Math.max(...coords.map(coord => coord.bottom)),
  } as PebDOMRect;

  const sectionDefs = tree.search({
    minX: elementRect.left,
    minY: elementRect.top + 1,
    maxX: elementRect.right,
    maxY: elementRect.bottom - 1,
  }).map((element: any) => {
    return renderer.getElementComponent(element.id).definition;
  });

  return sectionDefs;
}

export function getMagnetizingThreshold(
  renderer: any, // PebEditorRenderer
  elementRect: PebDOMRect
): number {
  let scale: number;

  scale = renderer.options.scale < .5 ? .5 : renderer.options.scale;

  if (elementRect.height > MAGNETIZING_THRESHOLD * 2 && elementRect.width > MAGNETIZING_THRESHOLD * 2) {
    return Math.floor(MAGNETIZING_THRESHOLD / scale);
  }

  scale = renderer.options.scale > 1 ? 1 : renderer.options.scale;

  return Math.floor(elementRect.height > elementRect.width
    ? (elementRect.height / 4) * scale
    : (elementRect.width / 4) * scale);
}

export function getMovementCandidates(guidelines, movement, nextRect) {
  const movementCandidates = Object.entries(guidelines).reduce((acc, [key, value]) => {
    if (!value) {
      return acc;
    }

    if (key === GuidelinePosition.Left) {
      return [
        ...acc,
        {
          ...value as any,
          dx: movement.dx - (nextRect.left - guidelines.left.minX),
          dy: null,
        },
      ];
    }

    if (key === GuidelinePosition.Center) {
      return [
        ...acc,
        {
          ...value as any,
          dx: movement.dx - (nextRect.left - guidelines.center.minX + (nextRect.width / 2)),
          dy: null,
        },
      ];
    }

    if (key === GuidelinePosition.Right) {
      return [
        ...acc,
        {
          ...value as any,
          dx: movement.dx - (nextRect.left - guidelines.right.minX + nextRect.width),
          dy: null,
        },
      ];
    }

    if (key === GuidelinePosition.Top) {
      return [
        ...acc,
        {
          ...value as any,
          dx: null,
          dy: movement.dy - (nextRect.top - guidelines.top.minY),
        },
      ];
    }

    if (key === GuidelinePosition.Middle) {
      return [
        ...acc,
        {
          ...value as any,
          dx: null,
          dy: movement.dy - (nextRect.top - guidelines.middle.minY + (nextRect.height / 2)),
        },
      ];
    }

    if (key === GuidelinePosition.Bottom) {
      return [
        ...acc,
        {
          ...value as any,
          dx: null,
          dy: movement.dy - (nextRect.top - guidelines.bottom.minY + nextRect.height),
        },
      ];
    }

    return acc;
  }, []);

  const left = movementCandidates.filter(candidate => candidate.dx !== null).sort((a, b) => a.dx - b.dx)[0];
  const top = movementCandidates.filter(candidate => candidate.dy !== null).sort((a, b) => a.dy - b.dy)[0];

  return { left, top };
}

// export function getGeneralRect(renderer: PebEditorRenderer, elementDefs: PebElementDef[]): PebDOMRect {
//   const coords = elementDefs.map((elementDef: PebElementDef) => {
//     const element = renderer.getElementComponent(elementDef.id);
//     const elementRect = renderer.getAbsoluteElementRect(element);
//
//     return elementRect;
//   });
//
//   const rect = {
//     left: Math.min(...coords.map(coord => coord.left)),
//     right: Math.max(...coords.map(coord => coord.right)),
//     top: Math.min(...coords.map(coord => coord.top)),
//     bottom: Math.max(...coords.map(coord => coord.bottom)),
//     height: null,
//     width: null,
//   } as PebDOMRect;
//
//   rect.height = rect.bottom - rect.top;
//   rect.width = rect.right - rect.left;
//
//   return rect;
// }

export function createDocumentRTree(
  page: PebThemePageInterface,
  renderer: any, // PebEditorRenderer
  onlySections = false,
  onlyChildren = false,
): RBush<BBox> {
  const document = renderer.getElementComponent(page.template.id);

  const elementDefs = document.children.reduce((acc, curr) => {
    const section = renderer.getElementComponent(curr.definition.id);

    return [
      ...acc,
      ...(onlySections ? [{ ...section.definition, zIndex: 0 }] : []),
      ...(onlyChildren ? getChildren(section, 1) : []),
    ];
  }, []);

  const tree = new RBush<BBox>();

  const items = elementDefs.reduce((acc, element) => {
    const elementComponent = renderer.getElementComponent(element.id);
    if (elementComponent) {
      const rect = elementComponent.nativeElement.getBoundingClientRect();
      acc.push({
        id: element.id,
        minX: rect.left,
        minY: rect.top,
        maxX: rect.right,
        maxY: rect.bottom,
        zIndex: element.zIndex,
      });
    }

    return acc;
  }, []);

  tree.load(items);

  return tree as RBush<BBox>;
}

export function getChildren(
  elementDef: any, // PebEditorElement
  zIndex = 0
): PebElementDef[] {
  return elementDef.children?.reduce((acc, curr) => {
    if (!!curr) {
      acc.push({ ...curr.definition, zIndex });
    }

    return curr.children ? [...acc, ...getChildren(curr, zIndex + 1)] : acc;
  }, []);
}
