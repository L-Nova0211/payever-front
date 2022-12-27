import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PebBaseEditorState } from '@pe/builder-services';

export interface PebShopEditorStateType {
  seoSidebarOpened: boolean;
}

const INITIAL_STATE: PebShopEditorStateType = {
  seoSidebarOpened: false,
};

@Injectable()
export class PebShopEditorState extends PebBaseEditorState {

  /**
   * SeoSidebarOpened
   */
  private readonly seoSidebarOpenedSubject$ = new BehaviorSubject<boolean>(INITIAL_STATE.seoSidebarOpened);
  readonly seoSidebarOpened$ = this.seoSidebarOpenedSubject$.asObservable();

  set seoSidebarOpened(val: boolean) {
    this.seoSidebarOpenedSubject$.next(val);
  }

  get seoSidebarOpened() {
    return this.seoSidebarOpenedSubject$.value;
  }
}
