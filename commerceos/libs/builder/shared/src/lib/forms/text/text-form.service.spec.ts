import { TestBed } from '@angular/core/testing';
import * as pebCore from '@pe/builder-core';
import {
  PebEditorState,
  PebEffectTarget,
  PebElementType,
  PebFunctionType,
  PebIntegrationActionTag,
  PebTemplateEffect,
  PebTextVerticalAlign,
} from '@pe/builder-core';
import { PEB_DEFAULT_TEXT_STYLE } from '@pe/builder-text-editor';
import { omit } from 'lodash';
import { of, Subject, Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { PebEditorRenderer } from '../../../renderer/editor-renderer';
import { PebEditorStore } from '../../../services';
import { PebTextFormService } from './text-form.service';

describe('PebTextFormService', () => {

  let service: PebTextFormService;
  let renderer: jasmine.SpyObj<PebEditorRenderer>;
  let editorStore: {
    page: {
      id: string;
      templateId: string;
    };
    commitAction: jasmine.Spy;
  };
  let selectedElements$: Subject<any[]>;

  beforeAll(() => {

    Object.defineProperty(pebCore, 'pebGenerateId', {
      value: pebCore.pebGenerateId,
      writable: true,
    });

  });

  beforeEach(() => {

    selectedElements$ = new Subject();
    spyOnProperty(PebTextFormService.prototype, 'selectedElements$').and.returnValue(selectedElements$);

    editorStore = {
      page: {
        id: 'p-001',
        templateId: 'tpl-001',
      },
      commitAction: jasmine.createSpy('commitAction'),
    };

    const rendererSpy = jasmine.createSpyObj<PebEditorRenderer>('PebEditorRenderer', [
      'getElementComponent',
    ]);

    TestBed.configureTestingModule({
      providers: [
        PebTextFormService,
        { provide: PebEditorState, useValue: {} },
        { provide: PebEditorStore, useValue: editorStore },
        { provide: PebEditorRenderer, useValue: rendererSpy },
      ],
    });

    service = TestBed.inject(PebTextFormService);
    renderer = TestBed.inject(PebEditorRenderer) as jasmine.SpyObj<PebEditorRenderer>;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should set elements$ on construct', () => {

    const elements = [
      {
        id: 'elem-001',
        type: PebElementType.Button,
      },
      {
        id: 'elem-002',
        type: PebElementType.Grid,
      },
    ];

    renderer.getElementComponent.and.callFake((id: string) => ({ id } as any));

    service.elements$.subscribe(elems => expect(elems).toEqual(elements.map(elem => ({ id: elem.id } as any))));
    selectedElements$.next(elements);

    expect(renderer.getElementComponent.calls.allArgs()).toEqual(elements.map(elem => [elem.id]));

  });

  it('should get text style observable', () => {

    const elements = {
      'elem-001': {
        id: 'elem-001',
        target: {
          textStyle$: of({
            color: '#333333',
          }),
        },
      },
      'elem-002': {
        id: 'elem-002',
        target: {
          textStyle$: of({
            color: '#222222',
          }),
        },
      },
      'elem-003': {
        id: 'elem-003',
        target: {
          textStyle$: of({
            color: ['#111111'],
          }),
        },
      },
    };
    let sub: Subscription;

    renderer.getElementComponent.and.callFake((id: string) => elements[id]);

    /**
     * 3 different elements with different colors
     */
    sub = service.textStyle$.subscribe(result => expect(result).toEqual({
      ...PEB_DEFAULT_TEXT_STYLE,
      color: ['#333333', '#222222', '#111111'],
    }));

    selectedElements$.next(Object.values(elements));
    sub.unsubscribe();

    /**
     * 2 different elements with the same color
     */
    delete elements['elem-003'];
    elements['elem-002'].target.textStyle$ = of({ color: '#333333' });

    sub = service.textStyle$.pipe(skip(1)).subscribe(result => expect(result).toEqual({
      ...PEB_DEFAULT_TEXT_STYLE,
      color: '#333333',
    }));

    selectedElements$.next(Object.values(elements));
    sub.unsubscribe();

  });

  it('should set text styles', () => {

    const element = {
      definition: {
        id: 'elem-001',
        type: PebElementType.Block,
        data: null,
      },
      styles: {
        verticalAlign: null,
      },
      target: {
        setTextStyle: jasmine.createSpy('setTextStyle'),
        effects: [{
          type: PebTemplateEffect.RelocateElement,
          target: `${PebEffectTarget.Templates}:${editorStore.page.templateId}`,
          payload: 'payload',
        }],
        element: {
          data: {
            functionLink: {
              functionType: PebFunctionType.Action,
              tags: [],
            },
          },
        },
        cdr: {
          detectChanges: jasmine.createSpy('detectChanges'),
        },
      },
      applyStyles: jasmine.createSpy('applyStyles'),
      detectChanges: jasmine.createSpy('detectChanges'),
    };
    const styles = {
      color: '#333333',
      fontWeight: 300,
      verticalAlign: null,
    };
    const generateIdSpy = spyOn(pebCore, 'pebGenerateId').and.returnValue('gid-001');
    let sub: Subscription;

    editorStore.commitAction.and.returnValue(of(null));

    /**
     * argument commitAction is FALSE as default
     */
    service.elements$ = selectedElements$;
    sub = service.setTextStyles(styles).subscribe();

    /**
     * in argument styles verticalAlign is null
     * element.target.element.data.functionLink.tags is []
     */
    selectedElements$.next([element]);

    expect(generateIdSpy).not.toHaveBeenCalled();
    expect(element.applyStyles).not.toHaveBeenCalled();
    expect(element.detectChanges).not.toHaveBeenCalled();
    expect(element.target.setTextStyle).toHaveBeenCalledWith(styles);
    expect(element.target.cdr.detectChanges).not.toHaveBeenCalled();
    expect(editorStore.commitAction).not.toHaveBeenCalled();

    /**
     * argument commitAction is TRUE
     * in argument styles verticalAlign is set
     * element.target.element.data.functionLink.tags is [PebIntegrationActionTag.GetCategoriesByProducts]
     */
    sub.unsubscribe();
    styles.verticalAlign = PebTextVerticalAlign.Bottom;
    element.target.element.data.functionLink.tags.push(PebIntegrationActionTag.GetCategoriesByProducts);

    sub = service.setTextStyles(styles, true).subscribe();
    selectedElements$.next([element]);

    expect(generateIdSpy).toHaveBeenCalled();
    expect(element.applyStyles).toHaveBeenCalled();
    expect(element.detectChanges).toHaveBeenCalled();
    expect(element.target.setTextStyle).toHaveBeenCalledWith(styles);
    expect(element.target.cdr.detectChanges).toHaveBeenCalled();
    expect(editorStore.commitAction).toHaveBeenCalled();
    expect(omit(editorStore.commitAction.calls.argsFor(0)[0], 'createdAt')).toEqual({
      effects: element.target.effects,
      id: 'gid-001',
      targetPageId: editorStore.page.id,
      affectedPageIds: [editorStore.page.id],
    });
    expect(editorStore.commitAction.calls.argsFor(0)[0].createdAt).toBeInstanceOf(Date);

  });

});
