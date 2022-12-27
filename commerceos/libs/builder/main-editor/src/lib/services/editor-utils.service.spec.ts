import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';

import { PebElementContextState, PebScreen } from '@pe/builder-core';
import { ContextBuilder } from '@pe/builder-services';

import { PebEditorUtilsService } from './editor-utils.service';

describe('PebEditorUtilsService', () => {

  let service: PebEditorUtilsService;

  beforeEach(() => {

    const contextBuilderSpy = jasmine.createSpyObj<ContextBuilder>('ContextBuilder', {
      buildSchema: of({ test: true }),
    });

    TestBed.configureTestingModule({
      providers: [
        PebEditorUtilsService,
        { provide: ContextBuilder, useValue: contextBuilderSpy },
      ],
    });

    service = TestBed.inject(PebEditorUtilsService);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should construct page snapshot', () => {

    const snapshotMock = {
      id: 'id',
      hash: btoa('shop'),
      shop: {
        contextId: 'sc-001',
      },
      pages: {
        'p-001': {
          id: 'p-001',
          name: 'page',
          variant: 'variant',
          type: 'type',
          data: {},
          templateId: 't-001',
          stylesheetIds: {
            [PebScreen.Desktop]: 'd-001',
          },
          contextId: 'c-001',
        },
      },
      templates: {
        't-001': {},
      },
      stylesheets: {
        'd-001': {},
      },
      contextSchemas: {
        'sc-001': {},
        'c-001': {},
      },
      updatedAt: 'updated',
      application: {
        context: {},
      },
    };
    const page$ = of({
      id: 'page',
      name: 'page',
      variant: 'variant',
      type: 'type',
      data: {},
      template: {},
      stylesheets: {
        [PebScreen.Desktop]: {},
      },
      context: {
        state: PebElementContextState.Ready,
        data: undefined,
      },
    });
    const screen = PebScreen.Desktop;
    const refresh = new BehaviorSubject<any>(null);

    // w/ page$
    service.constructPageSnapshot(of(snapshotMock) as any, page$ as any, of(screen)).subscribe((snapshot) => {
      page$.subscribe((page) => {
        delete page.stylesheets;
        expect(snapshot).toEqual({
          ...page,
          context: {
            test: true,
          },
          contextSchema: page.context,
          stylesheet: {},
        } as any);
      });
    });

  });

  it('should set destroyed subject on destroy', () => {

    const nextSpy = spyOn(service[`destroyedSubject$`], 'next').and.callThrough();
    const completeSpy = spyOn(service[`destroyedSubject$`], 'complete').and.callThrough();

    service.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();

  });

});
