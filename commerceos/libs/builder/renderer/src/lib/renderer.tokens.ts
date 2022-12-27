import { ComponentRef, EventEmitter, InjectionToken } from '@angular/core';

import { PebContext, PebStylesheet } from '@pe/builder-core';

import { ElementFactories } from './root/renderer.component';
import { PebAbstractRenderer } from './shared/abstract.renderer';

/** Element render function provided by renderer */
export const RENDERER_INTERACTION_EMITTER = new InjectionToken<EventEmitter<any>>('RENDERER_INTERACTION_EMITTER');

/** Styles */
export type GetStylesheetFunction = () => PebStylesheet;
export const RENDERER_GET_STYLESHEET = new InjectionToken<GetStylesheetFunction>('RENDERER_GET_STYLESHEET');

/** Context */
export type GetContextFunction = () => PebContext;
export const RENDERER_GET_CONTEXT = new InjectionToken<GetContextFunction>('RENDERER_GET_CONTEXT');

/** Component registry */
export type GetComponentRegistryFunction = (elementId: string) => ComponentRef<any>;
export const RENDERER_GET_COMPONENT_REGISTRY = new InjectionToken<GetComponentRegistryFunction>('RENDERER_GET_COMPONENT_REGISTRY');

/** Renderer */
export const RENDERER_PEB_RENDERER = new InjectionToken<PebAbstractRenderer>('RENDERER_PEB_RENDERER');

export const ELEMENT_FACTORIES = new InjectionToken<ElementFactories>('ELEMENT_FACTORIES');
