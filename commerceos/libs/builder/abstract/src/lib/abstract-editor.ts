import {
  ChangeDetectorRef,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  Injector,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';

import {
  PebContext,
  PebEditorCommand,
  PebElementDef,
  PebPageId,
  PebPageType,
  PebPageVariant,
  PebStylesheet,
  PebTemplate,
} from '@pe/builder-core';

export interface PageSnapshot {
  id: PebPageId;
  name: string;
  variant: PebPageVariant;
  type: PebPageType;
  data: {
    url?: string;
    mark?: string;
    preview?: string;
  };
  template: PebTemplate;
  stylesheet: PebStylesheet;
  context: PebContext;
}

export enum PebEditorSlot {
  sidebar = 'sidebarSlot',
  sidebarDetail = 'rightSidebarDetailSlot',
  sidebarOptionList = 'rightSidebarOptionList',
  contentContainer = 'contentContainer',
  ngContentContainer = 'ngContentContainer',
}

export abstract class PebAbstractEditor {

  commands$: Subject<PebEditorCommand>;

  contentContainer: ElementRef;

  /** @deprecated SHOULD BE PRIVATE */
  contentContainerSlot: ViewContainerRef;

  /** @deprecated SHOULD BE PRIVATE */
  abstract get sidebarSlot(): ViewContainerRef;

  detail: any;
  optionList: any;

  readonly cdr: ChangeDetectorRef;

  /** @deprecated */
  readonly cfr: ComponentFactoryResolver;

  /** @deprecated */
  readonly injector: Injector;

  readonly manipulateElementSubject$: Subject<any>; // ElementManipulation
  readonly manipulateElement$: Observable<any>; // ElementManipulation

  abstract get nativeElement(): HTMLElement;

  abstract getNewElementParent(): PebElementDef;

  abstract insertToSlot<T>(component: Type<T>, slot: PebEditorSlot): ComponentRef<T>;

  abstract backTo(direct: string): void;
  abstract clearSlot(slot: PebEditorSlot): void;

  /** @deprecated use insertToSlot with PebEditorSlot.sidebar argument */
  abstract openSidebar<T>(cmpClass: Type<T>): ComponentRef<T>;

  /** @deprecated should be implemented in the products plugin */
  abstract openProductsDialog(selectedProducts: string[]): Observable<string[]>;

  /** @deprecated should be implemented in the categories plugin */
  abstract openCategoriesDialog(categories, selectedCategories: string[]): Observable<string[]>;
}
