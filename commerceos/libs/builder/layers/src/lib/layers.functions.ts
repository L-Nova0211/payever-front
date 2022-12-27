import capitalize from 'lodash/capitalize';

import { LayerNode } from './layers.interfaces';

export const transformer = (node: LayerNode, level: number) => {
  return {
    expandable: !!node.children && node.children.length > 0,
    name: capitalize(node.type),
    level: level,
    type: node.type,
    isVisible: node.isVisible,
    id: node.id,
  };
};

export const sortByIndex = (arr: any[]) => {
  arr.sort((a, b) => a.index > b.index ? 1 : a.index < b.index ? -1 : 0);

  if (arr.length > 0) {
    arr.forEach(item => {
      if (!item.children) {return;}
      item.children = sortByIndex(item.children);
    });
  }

  return arr;
}
