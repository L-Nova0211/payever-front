import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { DockerItemInterface } from '../docker.interface';

import * as DockerActions from './docker.actions';

const dockerStateName = 'peDockerState';

export interface PeDockerState {
  dockerItems: DockerItemInterface[];
}

@State<PeDockerState>({
  name: dockerStateName,
  defaults: {
    dockerItems: [],
  },
})
@Injectable()
export class DockerState {
  @Selector()
  static dockerItems(state: PeDockerState): DockerItemInterface[] {
    return state.dockerItems;
  }

  @Action(DockerActions.SetDockerItems)
  setDockerItems(ctx: StateContext<PeDockerState>, { payload }: DockerActions.SetDockerItems) {
    ctx.patchState({ dockerItems: sortDockerItems(payload) });
  }

  @Action(DockerActions.ResetDockerItems)
  resetDockerItems(ctx: StateContext<PeDockerState>, { }: DockerActions.ResetDockerItems) {
    ctx.patchState({ dockerItems: [] })
  }
}

function sortDockerItems(items: DockerItemInterface[]): DockerItemInterface[] {
  const sortedItems = items.slice().sort((a: DockerItemInterface, b: DockerItemInterface) => {
    if (typeof a['order'] === 'undefined') {
      return 1;
    }
    if (typeof b['order'] === 'undefined') {
      return -1;
    }

    return a['order'] - b['order'];
  });
  const settingsIndex = sortedItems.findIndex((elem: any) => elem.code === 'settings');
  const settings = sortedItems.splice(settingsIndex, 1);
  sortedItems.push(...settings);

  return sortedItems;
}
