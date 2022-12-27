import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { PebLanguage, PebScreen } from '@pe/builder-core';

import {
  PebDefaultLanguageAction,
  PebDefaultScreenAction,
  PebEditorOptionsAction,
  PebScaleToFitAction,
  PebScreenAction,
  PebSetLanguageAction,
  PebSetScaleAction,
} from './editor.actions';

export class PebEditorOptions {
  screen: PebScreen;
  defaultScreen: PebScreen;
  scale: number;
  scaleToFit: boolean;
  language: PebLanguage;
  defaultLanguage: PebLanguage;
  interactions: boolean;
  readOnly: boolean;
}

@State<PebEditorOptions>({
  name: 'editorState',
  defaults: {
    screen: PebScreen.Desktop,
    defaultScreen: PebScreen.Desktop,
    scale: 1,
    scaleToFit: false,
    language: PebLanguage.English,
    defaultLanguage: PebLanguage.English,
    interactions: false,
    readOnly: false,
  },
})
@Injectable({ providedIn: 'root' })
export class PebEditorOptionsState {

  @Selector()
  static language(state: PebEditorOptions) {
    return state.language;
  }

  @Selector()
  static state(state: PebEditorOptions) {
    return state;
  }

  @Selector()
  static scale(state: PebEditorOptions) {
    return state.scale;
  }

  @Selector()
  static scaleToFit(state: PebEditorOptions) {
    return state.scaleToFit;
  }

  @Selector()
  static screen(state: PebEditorOptions) {
    return state.screen;
  }

  @Selector()
  static defaultScreen(state: PebEditorOptions) {
    return state.defaultScreen;
  }

  @Selector()
  static defaultLanguage(state: PebEditorOptions) {
    return state.defaultLanguage;
  }

  @Action(PebEditorOptionsAction)
  setOptions({ patchState }: StateContext<PebEditorOptions>, { payload }: PebEditorOptionsAction) {
    patchState(payload);
  }

  @Action(PebSetLanguageAction)
  setLanguage({ patchState }: StateContext<PebEditorOptions>, { payload }: PebSetLanguageAction) {
    patchState({ language: payload });
  }

  @Action(PebSetScaleAction)
  setScale({ patchState }: StateContext<PebEditorOptions>, { payload }: PebSetScaleAction) {
    patchState({ scale: payload });
  }

  @Action(PebScaleToFitAction)
  scaleToFit({ patchState }: StateContext<PebEditorOptions>, { payload }: PebScaleToFitAction) {
    patchState({ scaleToFit: payload });
  }

  @Action(PebScreenAction)
  setScreen({ patchState }: StateContext<PebEditorOptions>, { payload }: PebScreenAction) {
    patchState({ screen: payload });
  }

  @Action(PebDefaultScreenAction)
  setDefaultScreen({ patchState }: StateContext<PebEditorOptions>, { payload }: PebDefaultScreenAction) {
    patchState({ defaultScreen: payload });
  }

  @Action(PebDefaultLanguageAction)
  setDefaultLanguage({ patchState }: StateContext<PebEditorOptions>, { payload }: PebDefaultLanguageAction) {
    patchState({ defaultLanguage: payload });
  }
}
