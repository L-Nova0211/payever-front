import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import {
  PebAbstractTextEditorService,
  PebEditorElementInteraction,
  PebEditorState,
  PebElementType,
  PebPageType,
} from '@pe/builder-core';
import { isPlatformBrowser } from '@angular/common';

const PEB_EDITOR_STATE_STORAGE_KEYS = {
  sidebarsActivity: 'PEB_EDITOR_STATE_SIDEBARS_ACTIVITY',
};

export enum EditorSidebarTypes {
  Navigator = 'navigator',
  Inspector = 'inspector',
  Layers = 'layers',
}

export interface PebEditorStateType {
  locale: 'en' | 'de';
  sidebarType: PebElementType;
  pagesView: PebPageType;
  animating: boolean;
}

const INITIAL_STATE: PebEditorStateType = {
  locale: 'en',
  sidebarType: null,
  pagesView: PebPageType.Replica,
  animating: false,
};

function saveValueToStorage<T>(key: string, value: T): void {
  if (!PEB_EDITOR_STATE_STORAGE_KEYS[key]) {
    throw new Error(`There is no key: ${key} in PEB_EDITOR_STATE_STORAGE_KEYS`);
  }

  localStorage.setItem(PEB_EDITOR_STATE_STORAGE_KEYS[key], JSON.stringify(value));
}

function getValueFromStorage<T>(key: string): T {
  if (!PEB_EDITOR_STATE_STORAGE_KEYS[key]) {
    throw new Error(`There is no key: ${key} in PEB_EDITOR_STATE_STORAGE_KEYS`);
  }

  return JSON.parse(localStorage.getItem(PEB_EDITOR_STATE_STORAGE_KEYS[key]));
}

@Injectable()
export class PebBaseEditorState extends PebEditorState {
  /**
   * Sidebar type
   */
  private readonly sidebarTypeSubject$ = new BehaviorSubject<PebElementType>(INITIAL_STATE.sidebarType);
  readonly sidebarType$ = this.sidebarTypeSubject$.asObservable();

  set sidebarType(type: PebElementType) {
    this.sidebarTypeSubject$.next(type);
  }

  get sidebarType() {
    return this.sidebarTypeSubject$.value;
  }

  /**
   * Animating
   */
  private readonly animatingSubject$ = new BehaviorSubject<boolean>(INITIAL_STATE.animating);
  readonly animating$ = this.animatingSubject$.asObservable();

  set animating(val: boolean) {
    this.animatingSubject$.next(val);
  }

  get animating() {
    return this.animatingSubject$.value;
  }

  /**
   * Text Editor active
   */
  private readonly textEditorActiveSubject$ = new BehaviorSubject<PebAbstractTextEditorService>(null);
  readonly textEditorActive$ = this.textEditorActiveSubject$.asObservable();

  set textEditorActive(val: PebAbstractTextEditorService) {
    this.textEditorActiveSubject$.next(val);
  }

  get textEditorActive() {
    return this.textEditorActiveSubject$.value;
  }

  /**
   * @deprecated
   */
  private readonly miscSubject$: BehaviorSubject<{ seoSidebarOpened?: boolean }> = new BehaviorSubject({});
  readonly misc$ = this.miscSubject$.asObservable();

  get misc() {
    return this.miscSubject$.value;
  }

  set misc(val: any) {
    this.miscSubject$.next({ ...this.misc, ...val });
  }

  /**
   * Pages view
   */
  private readonly pagesViewSubject$ = new BehaviorSubject<PebPageType>(INITIAL_STATE.pagesView);
  readonly pagesView$ = this.pagesViewSubject$.asObservable();

  set pagesView(type: PebPageType) {
    this.pagesViewSubject$.next(type);
  }

  get pagesView() {
    return this.pagesViewSubject$.value;
  }

  /**
   * Sidebars activity
   */

  initialSidebarsActivity = {
    [EditorSidebarTypes.Navigator]: true,
    [EditorSidebarTypes.Inspector]: true,
    [EditorSidebarTypes.Layers]: false,
  };

  private readonly sidebarsActivitySubject$ =
    new BehaviorSubject<{ [key: string]: boolean }>(
      isPlatformBrowser(this.platformId)
        ? getValueFromStorage('sidebarsActivity') || this.initialSidebarsActivity
        : this.initialSidebarsActivity
    );

  readonly sidebarsActivity$ = this.sidebarsActivitySubject$.asObservable();

  set sidebarsActivity(type: { [key: string]: boolean }) {
    saveValueToStorage('sidebarsActivity', type);
    this.sidebarsActivitySubject$.next(type);
  }

  get sidebarsActivity() {
    return this.sidebarsActivitySubject$.value;
  }

  /**
   * User interaction start
   */
  private readonly interactionStartSubject$ = new Subject<PebEditorElementInteraction>();
  readonly interactionStart$ = this.interactionStartSubject$.pipe(share());

  /**
   * User interaction completed
   */
  private readonly interactionCompletedSubject$ = new Subject<PebEditorElementInteraction>();
  readonly interactionCompleted$ = this.interactionCompletedSubject$.pipe(share());

  constructor(
    @Inject(PLATFORM_ID) private platformId,
  ) {
    super();
  }

  startInteraction(value: PebEditorElementInteraction): void {
    this.interactionStartSubject$.next(value);
  }

  completeInteraction(value: PebEditorElementInteraction): void {
    this.interactionCompletedSubject$.next(value);
  }

  reset(): void {
    this.sidebarType = INITIAL_STATE.sidebarType;
    this.textEditorActive = null;
    this.misc = {};
    this.pagesView = INITIAL_STATE.pagesView;
    this.sidebarsActivity = this.initialSidebarsActivity;
  }
}
