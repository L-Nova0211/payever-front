import { ApmService } from '@elastic/apm-rum-angular';
import { BehaviorSubject, Observable } from 'rxjs';

import { PebAnimationType } from '@pe/builder-core';
import { PebAbstractElement } from '@pe/builder-renderer';

import { PebEditorRenderer } from './editor-renderer';
import {
  PebEditorElementPropertyAction,
  PebEditorElementPropertyBackground,
  PebEditorElementPropertyBuildIn,
  PebEditorElementPropertyBuildOut,
  PebEditorElementPropertyDescription,
  PebEditorElementPropertyFilter,
  PebEditorElementPropertyRadius,
  PebEditorElementPropertyShadow,
  PebEditorElementPropertyVideo,
} from './interfaces';

// TODO: move to PebEditorVideoElement
export enum VideoSourceType {
  MyVideo = 'my-video',
  Link = 'link',
}

export enum VideoSubTab {
  Media = 'media',
  Details = 'details',
}

export class PebEditorElement {
  controls: {
    // coords?: ComponentRef<PebElementCoordsControl>,
    // corners?: ComponentRef<PebShapeCornersControl>,
    // guidelinesCtrlRef?: ComponentRef<PebGuidelinesControl>,
    // borderRadius?: ComponentRef<PebElementBorderRadiusControl>,
  } = {};

  background?: PebEditorElementPropertyBackground;
  filter?: PebEditorElementPropertyFilter;
  shadow?: PebEditorElementPropertyShadow;
  description?: PebEditorElementPropertyDescription;
  video?: PebEditorElementPropertyVideo;
  radius?: PebEditorElementPropertyRadius;
  /**
   * Motion
   */
  buildIn?: PebEditorElementPropertyBuildIn;
  action?: PebEditorElementPropertyAction;
  buildOut?: PebEditorElementPropertyBuildOut;

  private readonly animatingSubject = new BehaviorSubject<boolean>(false);
  readonly animating$ = this.animatingSubject.asObservable();
  get animating() {
    return this.animatingSubject.getValue();
  }

  set animating(value: boolean) {
    this.animatingSubject.next(value);
  }

  constructor(
    private renderer: PebEditorRenderer,
    public target: PebAbstractElement,
    private readonly apmService: ApmService,
  ) {
    if (!target || !target.element) {
      // debugger;
      console.warn('------ SOMETHING WENT WRONG');
    }
  }

  get definition() {
    return this.target.element;
  }

  get styles() {
    return this.target.styles;
  }

  set styles(styles) {
    this.target.styles = styles;
  }

  get options() {
    return this.target.options;
  }

  get context() {
    return this.target.context;
  }

  get nativeElement(): HTMLElement {
    return this.target.nativeElement;
  }

  get parent(): PebEditorElement {
    return this.target.parent ? this.renderer.createEditorElement(this.target.parent) : null;
  }

  get children(): PebEditorElement[] {
    return this.definition.children?.map(elDef => this.renderer.getElementComponent(elDef.id)) ?? [];
  }

  get siblings(): PebEditorElement[] {
    return this.parent.children.filter(c => c && c !== this);
  }

  get contentContainer(): HTMLElement {
    return this.target.contentContainer;
  }

  detectChanges() {
    this.target.cdr.detectChanges();
  }

  applyAnimation(
    animation,
    motionType,
    { restore = false, animationType = animation.type, duration = animation.duration }: {
      restore?: boolean,
      animationType?: PebAnimationType,
      duration?: number,
    } = {},
  ): Observable<void> {
    return this.target.applyAnimation(animation, motionType, { restore, animationType, duration });
  }
}
