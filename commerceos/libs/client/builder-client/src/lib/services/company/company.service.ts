import { Injectable } from '@angular/core';
import { of } from 'rxjs';

import { PebElementContextState } from '@pe/builder-core';

import { PebClientStateService } from '../state.service';
import { PebClientStoreService } from '../store.service';

@Injectable()
export class CompanyService {

  get app() {
    return this.clientStore.app;
  }

  constructor(
    private clientStore: PebClientStoreService,
    private stateService: PebClientStateService,
  ) {
  }

  getLogo() {
    return of({
      state: 'ready',
      data: {
        src: this.app?.picture,
        name: this.app?.name,
      },
    });
  }

  toggleMobileMenu() {
    const currentState = this.stateService.state['@mobile-menu'];

    this.stateService.patch({
      '@mobile-menu': {
        state: PebElementContextState.Ready,
        data: {
          opened: !(currentState?.data?.opened === true),
        },
      },
    });
  }

  hideMobileMenu() {
    this.stateService.patch({
      '@mobile-menu': {
        state: PebElementContextState.Ready,
        data: {
          opened: false,
        },
      },
    });
  }
}
