import { forEach } from 'lodash';
import { EMPTY, Observable } from 'rxjs';

// import { PebAbstractEditor } from '@pe/builder-abstract';
import { PebAction, PebEditorState, PebElementDef, PebPageShort, PebShopEffect } from '@pe/builder-core';
// import { PebEditorElement, PebEditorRenderer } from '@pe/builder-main-renderer';


export function getUndoSourceActions(
  actions: PebAction[],
  activePage: PebPageShort,
): {
  actions: PebAction[],
  removedAction: PebAction,
} {
  const activePageId = activePage.id;
  const pageTargets = [activePageId];
  forEach(activePage.stylesheetIds, styleId => pageTargets.push(styleId));

  const pageActions = actions.filter((action: PebAction) => {
    const isInitAction = action.effects.findIndex(effect => effect.type === PebShopEffect.Init);
    if (isInitAction === -1) {
      // Only if action don't contain 'shop:init' effect type
      const effects: string[] = action.effects.map(effect => effect.target);

      return effects.filter(effect => !!pageTargets.find((target: string) => effect.includes(target))).length;
    }

    return [];
  });

  const lastAction = pageActions.length ? pageActions[pageActions.length - 1] : null;
  const returnValue = {
    actions: [],
    removedAction: null,
  };
  if (lastAction) {
    // Find index of last action related active page
    const lastActIndex = actions.findIndex(act => act.id === lastAction.id);
    // Remove last action related active page
    returnValue.removedAction = actions[lastActIndex];
    actions.splice(lastActIndex, 1);
    returnValue.actions = actions;
  }

  return returnValue;
}

// When we define parent element into which new element will be appended to, we should traverse
// elements tree till we encounter element that can actually be a parent (ie: logo element can't
// have children inside it)
export function getNextParentElement(
  state: PebEditorState,
  renderer: any,
  editor: any,
): Observable<any> {
  return EMPTY;
  // return editor.activePageSnapshot$.pipe(
  //   take(1),
  //   map((snapshot: PageSnapshot) => {
  //     let selectedElId = state.selectedElements;
  //     if (!selectedElId.length) {
  //       const visible = Object.keys(snapshot.stylesheet).filter(key => snapshot.stylesheet[key].display !== 'none');
  //       const children = renderer.element.children.filter(elm => visible.includes(elm.id));
  //
  //       selectedElId = children.map((elm) => {
  //         const target = renderer.getElementComponent(elm.id).target.nativeElement;
  //
  //         return { element: elm, top: target.getBoundingClientRect().top };
  //       }).sort((a, b) => b.top - a.top).reduce((acc, elm) => {
  //         if (acc.length === 0 || elm.top > 0) {
  //           return [elm];
  //         }
  //
  //         return acc;
  //       }, []).map(val => val.element.id);
  //     }
  //     let nextParentElement = renderer.getElementComponent(selectedElId[0]);
  //     if (!nextParentElement.isParent) {
  //       while (nextParentElement && nextParentElement.parent && !nextParentElement.isParent) {
  //         nextParentElement = nextParentElement.parent;
  //       }
  //     }
  //
  //     return nextParentElement;
  //   }),
  // );
}

export function isParentElement(element: PebElementDef, id: string): boolean {
  return element.children && element.children.map(child => child.id).includes(id);
}
