import { BBox } from 'rbush';
import * as voronoi from 'voronoi-diagram';

import {
  PebElementStyles,
  PebElementType,
  PebScreen,
  pebScreenContentWidthList,
  pebScreenDocumentWidthList,
} from '@pe/builder-core';
import { PebAbstractElement, PebRTree } from '@pe/builder-renderer';


export function findAvailablePosition(
  screen: PebScreen,
  tree: PebRTree<PebAbstractElement>,
  parent: PebAbstractElement,
  styles: PebElementStyles
): { left: number, top: number } {
  let left: number;
  let top: number;

  const parentType = parent.element.type;
  const padding = parentType === PebElementType.Section && screen === PebScreen.Desktop && !parent.data?.fullWidth
    ? ((pebScreenDocumentWidthList[screen] - pebScreenContentWidthList[screen]) / 2)
    : 0;
  const parentBBox = { ...tree.toBBox(parent) };

  parentBBox.minX += padding;
  parentBBox.maxX -= padding;

  const getPoints = (bBox: BBox): number[][] => {
    return [
      [ bBox.minX, bBox.minY ],
      [ bBox.maxX, bBox.minY ],
      [ bBox.maxX, bBox.maxY ],
      [ bBox.minX, bBox.maxY ],
    ];
  };

  const parentPoints = getPoints(parentBBox);
  const childPoints = [];
  const childIds = parent.children.map((child) => {
    const childBBox = tree.toBBox(child);

    childPoints.push(...getPoints(childBBox));

    return child.element.id;
  });

  const points = childPoints.reduce((acc, [cX, cY]) => {
    if (acc.findIndex(([aX, aY]) => Math.round(aX) === Math.round(cX) && Math.round(aY) === Math.round(cY)) === -1) {
      acc.push([cX, cY]);
    }

    return acc;
  }, [ ...parentPoints ]);

  const positions: { x: number, y: number }[] = voronoi(points).positions.reduce((acc, [x, y]) => {
    if (x && y) {
      // TODO: Need think :|
      if (x > parentBBox.maxX) { x = parentBBox.maxX }
      if (y > parentBBox.maxY) { y = parentBBox.maxY }
      if (x < parentBBox.minX) { x = parentBBox.minX }
      if (y < parentBBox.minY) { y = parentBBox.minY }

      const bBox = { minX: x, maxX: x, minY: y, maxY: y };
      const intersectedIds = tree.search(bBox).map(elm => elm.element.id);

      if (!childIds.some(id => intersectedIds.includes(id))) {
        acc.push({ x, y });
      }
    }

    return acc;
  }, []);

  const parentVertices = [
    { x: parentBBox.minX, y: parentBBox.minY },
    { x: parentBBox.maxX, y: parentBBox.minY },
    { x: parentBBox.maxX, y: parentBBox.maxY },
    { x: parentBBox.minX, y: parentBBox.maxY },
  ];
  const childVertices = childPoints.map(([x, y]: number[]) => ({ x, y }));
  const vertices = [ ...parentVertices, ...childVertices ];

  const isIntersected = (bBox: BBox): boolean => {
    return tree.search(bBox)
      .filter((elm) => parent.children.findIndex(child => child.element.id === elm.element.id) !== -1)
      .every((elm) => {
        const currBBox = tree.toBBox(elm);

        // TODO: Need think :|
        return bBox.minX === currBBox.maxX
          || bBox.minY === currBBox.maxY
          || bBox.maxX === currBBox.minX
          || bBox.maxY === currBBox.minY;
      });
  };

  for (let i = 0; i < positions.length; i++) {
    const position = positions[i];
    const space = [];

    vertices.forEach((vertex: { x: number, y: number }) => {
      const vertexBBox = {
        minX: vertex.x > position.x ? position.x : vertex.x,
        maxX: vertex.x > position.x ? vertex.x : position.x,
        minY: vertex.y > position.y ? position.y : vertex.y,
        maxY: vertex.y > position.y ? vertex.y : position.y,
      };

      if (isIntersected(vertexBBox)) {
        space.push(vertexBBox);
      }
    });

    const spaceBBox = {
      minX: Math.min(...space.map(s => s.minX)),
      maxX: Math.max(...space.map(s => s.maxX)),
      minY: Math.min(...space.map(s => s.minY)),
      maxY: Math.max(...space.map(s => s.maxY)),
    };

    const spaceHeight = spaceBBox.maxY - spaceBBox.minY;
    const spaceWidth = spaceBBox.maxX - spaceBBox.minX;

    if ((spaceHeight > styles.height && spaceWidth >= styles.width
      || spaceHeight >= styles.height && spaceWidth > styles.width
      || spaceHeight > styles.height && spaceWidth > styles.width)
      && isIntersected(spaceBBox)
    ) {
      left = spaceBBox.minX - parentBBox.minX;
      top = spaceBBox.minY - parentBBox.minY;

      break;
    }
  }

  return { left, top };
}
