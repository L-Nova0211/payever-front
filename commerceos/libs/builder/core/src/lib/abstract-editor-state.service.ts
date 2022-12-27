import { Observable } from 'rxjs';

import { PebPageType } from './models/client';
import { PebAbstractTextEditorService } from './models/editor';
import { PebElementType } from './models/element';

/**
 * User interaction with selected element
 */
export enum PebEditorElementInteraction {
  Move = 'move',
  Resize = 'resize',
}


export abstract class PebEditorState {
  abstract animating: boolean;
  abstract animating$: Observable<boolean>;
  abstract sidebarType: PebElementType;
  abstract sidebarType$: Observable<PebElementType>;
  abstract textEditorActive: PebAbstractTextEditorService;
  abstract textEditorActive$: Observable<PebAbstractTextEditorService>;
  /** @deprecated */
  abstract misc: { seoSidebarOpened?: boolean; };
  /** @deprecated */
  abstract misc$: Observable<{ seoSidebarOpened?: boolean; }>;
  abstract pagesView: PebPageType;
  abstract pagesView$: Observable<PebPageType>;
  abstract sidebarsActivity: { [key: string]: boolean };
  abstract sidebarsActivity$: Observable<{ [key: string]: boolean }>;
  abstract interactionStart$: Observable<PebEditorElementInteraction>;
  abstract interactionCompleted$: Observable<PebEditorElementInteraction>;
  abstract startInteraction(value: PebEditorElementInteraction): void;
  abstract completeInteraction(value: PebEditorElementInteraction): void;
  abstract reset(): void;
}
