import { InjectionToken, Injector, Type } from '@angular/core';
import { Observable } from 'rxjs';

// import { PebEditorAbstractNavigation, PebEditorAbstractToolbar } from '@pe/builder-abstract';
import { PebEditorState } from '@pe/builder-core';


type Toolbar = new (injector: Injector) => any;
type Navigation = new (injector: Injector) => any;

export interface PebEditorUiConfig {
  toolbar: Toolbar;
  navigation: Navigation;
}

export function getEventPosition(evt: MouseEvent | TouchEvent): {
  clientX: number,
  clientY: number,
  screenX: number,
  screenY: number,
} {
  const { clientX, clientY, screenX, screenY } = isTouchEvent(evt) ? evt.changedTouches[0] : evt;

  return { clientX, clientY, screenX, screenY };
}

export function isTouchEvent(event: TouchEvent | MouseEvent | PointerEvent): event is TouchEvent {
  return (event as TouchEvent).touches !== undefined;
}

export interface PebEditorConfig {
  ui?: PebEditorUiConfig;
  makers?: { [element: string]: any };
  plugins?: any[];
  state?: Type<PebEditorState>;
}

export interface AfterGlobalInit<T = any> {
  afterGlobalInit: () => Observable<T>;
}

export interface AfterPageInit<T = any> {
  afterPageInit: () => Observable<T>;
}

export const EDITOR_CONFIG_UI = new InjectionToken<PebEditorUiConfig>('EDITOR_CONFIG_UI');

export const PEB_EDITOR_CONFIG = new InjectionToken<PebEditorConfig>('EDITOR_CONFIG');

export const PEB_EDITOR_PLUGINS = new InjectionToken<Array<AfterGlobalInit | AfterPageInit>>('EDITOR_PLUGINS');

