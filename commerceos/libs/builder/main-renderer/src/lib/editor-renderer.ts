import { ApmService } from '@elastic/apm-rum-angular';
import { Observable } from 'rxjs';

import { PebElementDef, PebElementId } from '@pe/builder-core';
import { PebAbstractElement, PebRenderer, PebRendererOptions } from '@pe/builder-renderer';

import { PebEditorElement } from './editor-element';


export const elementCache = new WeakMap<PebAbstractElement, PebEditorElement>();

/**
 * This class is a wrapper on _renderer that serves two purposes:
 *  expand _renderer's elements with methods that are needed only in editor
 *  deny direct access to properties and methods of _renderer that shouldn't be accessible
 */
export class PebEditorRenderer {

  readonly elementCache = elementCache;

  constructor(
    private renderer: PebRenderer,
    private apmService: ApmService,
  ) { }

  get destroyed$() {
    return this.renderer.destroyed$;
  }

  get options(): PebRendererOptions {
    return this.renderer.options;
  }

  get contentDocument(): Document {
    return this.renderer.contentDocument;
  }

  get rendered(): Observable<any> {
    return this.renderer.rendered;
  }

  get nativeElement(): HTMLElement {
    return this.renderer.nativeElement;
  }

  setRenderer(renderer: PebRenderer) {
    this.renderer = renderer;
  }

  get element(): PebElementDef {
    return this.renderer.element;
  }

  createEditorElement(target: PebAbstractElement) {
    if (this.elementCache.get(target)) {
      return this.elementCache.get(target);
    }

    const element = new PebEditorElement(this, target, this.apmService);

    this.elementCache.set(target, element);

    return element;
  }

  getElementComponent = (elementId: PebElementId) => {
    const element: PebAbstractElement = this.renderer.registry.get(elementId);

    if (!element) {
      return null;
    }

    return this.createEditorElement(element);
  }

  getElement = (elementId: PebElementId): PebElementDef => this.renderer.elementRegistry.get(elementId);
}
