import { TreeFilterNode } from '@pe/common';

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function dynamicSort(property, sortOrder = 1) {
  return (a, b) => {
    let result;
    if (typeof a[property] === 'string' || a[property] instanceof String) {
      result = (a[property].toLowerCase() < b[property].toLowerCase())
        ? -1 : (a[property].toLowerCase() > b[property].toLowerCase()) ? 1
        : 0;
    } else {
      result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    }

    return result * sortOrder;
  };
}

export function sortByField(array: any[], sortOptions: { order: string, param: string }) {
  return sortOptions ? array.sort(dynamicSort(sortOptions.param, sortOptions.order === 'asc' ? 1 : -1)) : array;
}

export function listToTree(list: TreeFilterNode[]) {
  const map = {};
  const roots = [];

  for (let i = 0; i < list.length; i ++) {
    map[list[i].id] = i; // initialize the map
    list[i].children = []; // initialize the children
  }

  for (let i = 0; i < list.length; i ++) {
    const node = list[i];
    if (node.parentId !== null) {
      // if you have dangling branches check that map[node.parentId] exists
      list[map[node.parentId]]?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function searchInTree(tree, value, key = 'id', reverse = false) {
  const stack = [ tree[0] ];
  while (stack.length) {
    const node = stack[reverse ? 'pop' : 'shift']();
    if (node[key] === value) {
      return node;
    }
    if (node.children) {
      stack.push(...node.children);
    }
  }

  return null;
}
