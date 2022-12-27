import { PebLanguage, PebScreen } from '@pe/builder-core';

import { PebEditorOptions } from './editor.state';

export class PebEditorOptionsAction {
  static readonly type = '[Peb/EditorOptions] Set';
  constructor(public payload: Partial<PebEditorOptions>) { }
}

export class PebSetLanguageAction {
  static readonly  type = '[Peb/EditorOptions] Set Language';
  constructor(public payload: PebLanguage) { }
}

export class PebSetScaleAction {
  static readonly type = '[Peb/EditorOptions] Set Scale';
  constructor(public payload: number) { }
}

export class PebScaleToFitAction {
  static readonly type = '[Peb/EditorOptions] ScaleToFit';
  constructor(public payload: boolean) { }
}

export class PebScreenAction {
  static readonly type = '[Peb/EditorOptions] Set Screen';
  constructor(public payload: PebScreen) { }
}

export class PebDefaultScreenAction {
  static readonly type = '[Peb/EditorOptions] Set Default Screen';
  constructor(public payload: PebScreen) { }
}

export class PebDefaultLanguageAction {
  static readonly type = '[Peb/EditorOptions] Set Default Language';
  constructor(public payload: PebLanguage) { }
}
