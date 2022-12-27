import { cloneDeep, isArray, merge } from 'lodash';

import { PebScreen } from '../constants';
import { PebElementStyles, PebTemplate } from '../models/client';
import { PebElementKitDeep, PebElementTransformationDeep } from '../models/editor';
import { PebElementContextState, PebElementDef, PebElementId } from '../models/element';

import { pebGenerateId } from './generate-id';

export interface PebHasChildren<T = any> {
  children?: T[];
}

export function pebMapElementDeep<T extends PebElementDef>(
  element: T,
  handler: (el: PebElementDef) => PebElementDef,
): T {
  const handled = handler(element);
  const children = handled?.children;

  return {
    ...handled,
    children:
      children ?
        (children.length ? children.map(child => pebMapElementDeep(child, handler)) : []) :
        element?.children,
  } as T;
}

export function pebFindElementDeep(
  element: PebElementDef,
  handler: (el: PebElementDef) => boolean,
): PebElementDef {
  return element.children?.reduce(
    (acc, el) => acc ? acc : handler(el) ? el : pebFindElementDeep(el, handler),
    undefined,
  );
}

export function pebFilterElementsDeep(
  element: PebElementDef,
  handler: (el: PebElementDef) => boolean = el => !!el,
): PebElementDef[] {
  return element.children?.reduce(
    (acc, el) => {

      if (handler(el)) {
        acc.push(el);
      }

      return el?.children ? [...acc, ...pebFilterElementsDeep(el, handler)] : acc;
    },
    [],
  );
}

export function pebForEachObjectWithChildrenDeep(
  element: PebHasChildren,
  handler: (el: PebHasChildren) => void,
): void {
  handler(element);
  element.children?.forEach((child) => {
    pebForEachObjectWithChildrenDeep(child, handler);
  });
}

export function pebMapObjectWithChildrenDeep<T = any>(
  element: PebHasChildren,
  handler: (el: PebHasChildren) => T,
): T[] {
  return element.children.reduce(
    (acc, child) => [...acc, ...pebMapObjectWithChildrenDeep(child, handler)],
    [handler(element)],
  );
}

export function getElementKitTransformationDeep(
  elementKit: PebElementKitDeep,
  generateId: boolean = false,
): PebElementTransformationDeep {
  const newId = el => generateId || !el?.element?.id ? pebGenerateId() : el.element.id;
  const result: PebElementTransformationDeep = {
    definition: null,
    styles: Object.values(PebScreen).reduce(
      (acc, screen) => {
        acc[screen] = {};

        return acc;
      },
      {},
    ),
    contextSchema: {},
    context: {},
  };
  const getDefinitionChildren = (el: PebElementKitDeep) => {
    const id = newId(el);
    const newDef = {
      meta: { deletable: true },
      ...cloneDeep(el.element),
      id,
      children: [],
    };
    Object.values(PebScreen).forEach((screen) => {
      result.styles[screen][id] = el.styles[screen];
    });
    result.context[id] = { state: PebElementContextState.Ready, data: el.context };
    result.contextSchema[id] = el.contextSchema;
    newDef.children = el.children?.map(child => getDefinitionChildren(child));

    return newDef;
  };
  result.definition = getDefinitionChildren(elementKit);

  return result;
}

export function getElementKitSwitchScreenTransformationDeep(
  elementKit: PebElementKitDeep,
  generateId: boolean = false,
  fromScreen: PebScreen,
  toScreen: PebScreen,
  defaultStyles: PebElementStyles = { display: 'none' },
): PebElementTransformationDeep {
  const newId = el => generateId || !el?.element?.id ? pebGenerateId() : el.element.id;
  const result: PebElementTransformationDeep = {
    definition: null,
    styles: Object.values(PebScreen).reduce(
      (acc, screen) => {
        acc[screen] = {};

        return acc;
      },
      {},
    ),
    contextSchema: {},
    context: {},
  };
  const getDefinitionChildren = (el: PebElementKitDeep) => {
    const id = newId(el);
    const newDef = {
      ...cloneDeep(el.element),
      id,
      children: [],
    };
    result.styles[toScreen][id] = { ...el.styles[fromScreen] };
    Object.values(PebScreen).forEach((screen) => {
      if (screen !== toScreen) {
        result.styles[screen][id] = screen !== fromScreen ? el.styles[screen] : { ...defaultStyles };
      }
    });
    result.context[id] = el.context;
    result.contextSchema[id] = el.contextSchema;
    newDef.children = el.children?.map(child => getDefinitionChildren(child));

    return newDef;
  };
  result.definition = getDefinitionChildren(elementKit);

  return result;
}

export function mapToTableLayout(table: any, childrenContainer?: any): void {
  const children = [].slice.call(childrenContainer.nativeElement.children);
  const rows: HTMLTableRowElement[] = [].slice.call(table.nativeElement.children);

  if (children.length > 1) {
    children.forEach((child, childIdx) => {
      const [rowPos, colPos] = child.style.gridArea.split(' / ').slice(0, 2);

      rows.forEach((row, rowIdx) => {
        if (rowIdx + 1 === +rowPos) {
          const wrapper = row.children.item(colPos - 1).firstChild;
          if (wrapper.firstChild) {
            wrapper.removeChild(wrapper.firstChild);
          }
          wrapper.appendChild(child);
        }
      });
    });
  } else if (children.length === 1) {
    const wrapper = rows[0].firstChild.firstChild;
    if (wrapper.firstChild) {
      wrapper.removeChild(wrapper.firstChild);
    }
    wrapper.appendChild(children[0]);
  }
}

export function getTableGridValues(styles: any): { gridRowHeights: string[], gridColumnWidths: string[] } {
  return {
    gridRowHeights: styles.gridTemplateRows?.map(v => `${v}px`) ?? ['auto'],
    gridColumnWidths: styles.gridTemplateColumns?.map(v => `${v}px`) ?? ['auto'],
  };
}


/** @deperecated use pebFindElementDeep instead */
export function pebFilterElementDeep(
  element: PebElementDef,
  handler: (el: PebElementDef) => boolean,
): PebTemplate | PebElementDef {
  const nextChildren = element.children?.filter(handler);

  return {
    ...merge({}, element),
    children: nextChildren?.map(child => pebFilterElementDeep(child, handler)),
  };
}

/** @deperecated use pebFilterElementsDeep instead */
export function pebTraverseElementDeep(
  element: PebElementDef,
  handler: (el: PebElementDef) => any,
): void {
  handler(merge({}, element));

  if (isArray(element.children)) {
    element.children.forEach(el => pebTraverseElementDeep(el, handler));
  }
}

/** @deperecated */
export function pebFindElementParents(document: PebElementDef, id: PebElementId): PebElementDef[] {
  const stack = [{ node: document, i: 0 }];
  while (stack.length) {
    let current = stack[stack.length - 1];
    while (current.i < current.node.children.length) {
      const node = current.node.children[current.i];

      if (node.id === id) {
        return stack
          .filter(el => el.node.id !== document.id)
          .map(el => el.node);
      }

      stack.push({ node, i: 0 });
      current.i = current.i + 1;
      current = stack[stack.length - 1];
    }

    stack.pop();
  }

  return null;
}

/** @deperecated */
export function pebTraverseElementDeepWithParent(
  element: PebElementDef,
  handler: (el: any) => any,
  parentId: null | string = null,
  priority: any = -1,
): void {
  const nextPriority = parseInt(priority, 10) + 1;
  handler({ ...element, parentId, priority: nextPriority });

  if (isArray(element?.children)) {
    element.children.forEach(el => pebTraverseElementDeepWithParent(el, handler, element.id, nextPriority));
  }
}

export function generateGrid(element, styles) {
  let columns = [0];
  let rows = [0];

  element.children.forEach((child: any) => {
    columns.push(child.styles.left, child.styles.left + child.styles.width);
    rows.push(child.styles.top, child.styles.top + child.styles.height);
  });

  columns = columns.sort((a, b) => a - b);
  rows = rows.sort((a, b) => a - b);

  const columnPoints = [];

  if (columns.length) {
    columns.reduce((previous, current) => {
      columnPoints.push(current - previous);

      return current;
    });
  }

  const rowPoints = [];

  if (rows.length) {
    rows.reduce((previous, current) => {
      rowPoints.push(current - previous);

      return current;
    });
  }

  element.children.forEach((child: any) => {
    const columnStart = columns.findIndex(c => c === child.styles.left);
    const columnEnd = columns.findIndex(c => c === child.styles.left + child.styles.width);
    const rowStart = rows.findIndex(r => r === child.styles.top);
    const rowEnd = rows.findIndex(r => r === child.styles.top + child.styles.height);

    child.styles.gridArea = `${rowStart + 1} / ${columnStart + 1} / span ${rowEnd - rowStart} / span ${columnEnd - columnStart}`;
  });

  styles.display = 'grid';
  styles.gridTemplateColumns = columnPoints.join(' ');
  styles.gridTemplateRows = rowPoints.join(' ');
}
