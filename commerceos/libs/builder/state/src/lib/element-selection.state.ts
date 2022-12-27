import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { isIntegrationAction, PebElementType, PebIntegrationActionTag } from '@pe/builder-core';
import { PebEditorAccessorService } from '@pe/builder-services';

import { PebElementSelection } from './element-selection';
import {
  PebDeselectAllAction,
  PebCloseGroupAction,
  PebSelectAction,
  PebOpenGroupAction,
} from './element-selection.actions';


@State<PebElementSelection>({
  name: 'selectedElements',
  defaults: {
    elements: [],
    id: [],
    group: undefined,
    // selection: undefined,
  },
})
@Injectable({ providedIn: 'root' })
export class PebElementSelectionState {

  constructor(private editorAccessorService: PebEditorAccessorService) {
  }

  @Selector()
  static elements(state: PebElementSelection) {
    return state.elements;
  }

  @Selector()
  static textElements(state: PebElementSelection) {
    const elements = state.elements.reduce((acc, elm) => {
      if (elm.type === PebElementType.Grid) {
        if (!elm.data.functionLink) {
          return [
            ...acc,
            ...elm.children.filter(({ type }) => [PebElementType.Text, PebElementType.Shape].includes(type)),
          ];
        }

        if (isIntegrationAction(elm.data?.functionLink)
          && elm.data.functionLink.tags.includes(PebIntegrationActionTag.GetCategoriesByProducts)
        ) {
          return [...acc, elm];
        }
      }

      if ([PebElementType.Text, PebElementType.Shape].includes(elm.type)) {
        return [...acc, elm];
      }

      return acc;
    }, []);

    return elements;
  }

  @Selector()
  static openGroup(state: PebElementSelection) {
    return state.group;
  }

  @Selector()
  static id(state: PebElementSelection) {
    return state.id;
  }

  @Action(PebSelectAction)
  select({ getState, setState }: StateContext<PebElementSelection>, { payload }: PebSelectAction) {
    const state = getState();
    const ids = typeof payload === 'string' ? [payload] : payload;
    if (state.id.length !== ids.length || !state.id.every(id => ids.includes(id))) {
      const elements = ids.map(id => this.editorAccessorService.renderer.elementRegistry.get(id));
      setState({
        elements,
        id: ids,
      });
    }
  }

  @Action(PebDeselectAllAction)
  deselect({ setState }: StateContext<PebElementSelection>) {
    setState({
      elements: [],
      id: [],
    });
  }

  @Action(PebOpenGroupAction)
  selectGroup({ patchState }: StateContext<PebElementSelection>, { payload }: PebOpenGroupAction) {
    patchState({ group: payload });
  }

  @Action(PebCloseGroupAction)
  deselectGroup({ patchState }: StateContext<PebElementSelection>) {
    patchState({ group: undefined });
  }
}
