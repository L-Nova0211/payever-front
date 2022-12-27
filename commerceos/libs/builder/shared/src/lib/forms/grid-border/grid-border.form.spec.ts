import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxsModule, Store } from '@ngxs/store';
import { merge } from 'lodash';
import { of, queueScheduler, Subject } from 'rxjs';
import { observeOn, skip, take, tap } from 'rxjs/operators';

import {
  createGridCellElementBorderStyles,
  getGridCellElementBordersChanges,
  getGridCellElementBordersSquare,
  getPebGridElementBorderOptions,
  PebElementDef,
  PebElementType,
  pebGenerateId,
  PebGridElementBorderOption,
  PebTemplateEffect,
} from '@pe/builder-core';
import { PebEditorRenderer } from '@pe/builder-main-renderer';
import { PebRendererSharedModule } from '@pe/builder-renderer';
import { PebEditorAccessorService, PebEditorStore } from '@pe/builder-services';
import { PebElementSelectionState, PebSelectAction } from '@pe/builder-state';

import { PebFormControlModule } from '../../form-control';

import { PebGridBorderForm } from './grid-border.form';

function createElementDef(elementDef: Partial<PebElementDef>): PebElementDef {
  return {
    id: pebGenerateId(),
    type: PebElementType.Grid,
    data: {},
    children: [],
    ...elementDef,
  };
}

describe('EditorGridBorderForm', () => {

  let fixture: ComponentFixture<PebGridBorderForm>;
  let component: PebGridBorderForm;
  let editor: { insertToSlot: jasmine.Spy; detail?: null; };
  let editorStore: jasmine.SpyObj<PebEditorStore>;
  let editorRenderer: {
    rendered: Subject<void>,
    getElement: jasmine.Spy<(id: string) => PebElementDef>,
  };
  let iconRegistry: MatIconRegistry;
  let store: Store;
  let documentDef: PebElementDef;
  let gridDef: PebElementDef;
  let gridCells: PebElementDef[];
  let elementDefs: PebElementDef[];

  beforeEach(waitForAsync(() => {

    editor = {
      detail: null,
      insertToSlot: jasmine.createSpy('insertToSlot'),
    };
    editorRenderer = {
      rendered: new Subject<void>(),
      getElement: jasmine.createSpy('getElement'),
    };

    documentDef = createElementDef({
      type: PebElementType.Document,
    });
    gridDef = createElementDef({
      type: PebElementType.Grid,
      parent: documentDef,
      data: { colCount: 3, rowCount: 2 },
    });
    gridCells = [
      createElementDef({ type: PebElementType.Shape, parent: gridDef }),
      createElementDef({ type: PebElementType.Shape, parent: gridDef }),
      createElementDef({ type: PebElementType.Shape, parent: gridDef }),
      createElementDef({ type: PebElementType.Shape, parent: gridDef }),
      createElementDef({ type: PebElementType.Shape, parent: gridDef }),
      createElementDef({ type: PebElementType.Shape, parent: gridDef }),
    ];
    gridDef.children = gridCells;
    documentDef.children.push(gridDef);
    elementDefs = [documentDef, gridDef, ...gridCells];

    editorStore = jasmine.createSpyObj('PebEditorStore', ['commitAction'], {
      page: { templateId: documentDef.id },
    });

    editorRenderer.getElement.and.callFake((id) => {
      return elementDefs.find(el => el.id === id);
    });
    editorStore.commitAction.and.callFake((action) => {
      action.effects.forEach((effect) => {
        if (effect.type === PebTemplateEffect.UpdateElement) {
          elementDefs.map(el => el.id === effect.payload.id ? Object.assign(el, effect.payload) : el);
        }
      });

      return of(undefined);
    });

    TestBed.configureTestingModule({
      declarations: [PebGridBorderForm],
      imports: [
        ReactiveFormsModule,
        PebRendererSharedModule,
        PebFormControlModule,
        HttpClientTestingModule,
        NgxsModule.forRoot([PebElementSelectionState]),
      ],
      providers: [
        {
          provide: PebEditorAccessorService,
          useValue: {
            editorComponent: editor,
            renderer: {
              elementRegistry: {
                get: editorRenderer.getElement,
              },
            },
          },
        },
        { provide: PebEditorStore, useValue: editorStore },
        { provide: PebEditorRenderer, useValue: editorRenderer },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebGridBorderForm);
      component = fixture.componentInstance;

      iconRegistry = TestBed.inject(MatIconRegistry);
      const domSanitizer = TestBed.inject(DomSanitizer);
      store = TestBed.inject(Store);
    });

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should return selected grid with cells', () => {
    component.selectedGridElements$.pipe(
      skip(1),
      take(1),
      observeOn(queueScheduler),
      tap((elements) => {
        expect(elements).toBeTruthy();
        expect(elements.gridElement).toEqual(gridDef);
        expect(elements.cells).toEqual([]);
      }),
    ).toPromise();

    store.dispatch(new PebSelectAction([gridDef.id]));

    component.selectedGridElements$.pipe(
      skip(1),
      take(1),
      observeOn(queueScheduler),
      tap((elements) => {
        expect(elements).toBeTruthy();
        expect(elements.gridElement).toEqual(gridDef);
        expect(elements.cells).toEqual([
          {
            id: gridCells[0].id,
            element: gridCells[0],
            index: 0,
            row: 0,
            col: 0,
          },
          {
            id: gridCells[3].id,
            element: gridCells[3],
            index: 3,
            row: 1,
            col: 0,
          },
        ]);
      }),
    ).toPromise();

    store.dispatch(new PebSelectAction([gridCells[0].id, gridCells[3].id]));
  });

  it('should update border options', () => {
    const borderOption = PebGridElementBorderOption.InnerAll;
    const borderOptions = getPebGridElementBorderOptions(borderOption);
    const color = '#ff00ff';
    const width = 2;
    const gridData = { colCount: 3, rowCount: 2 };
    const bordersSquare = getGridCellElementBordersSquare({
      borderOption,
      borderStyle: { color, width, style: 'solid' },
      colCount: gridData.colCount,
      minCol: 0,
      maxCol: gridData.colCount - 1,
      maxRow: gridData.rowCount - 1,
      minRow: 0,
    });
    const borderChanges = Object.entries(bordersSquare).reduce((acc, [index, border]) => {
      const changes = getGridCellElementBordersChanges({
        index: +index,
        colCount: gridData.colCount,
        cellElementBorders: border,
      });

      return merge(acc, changes);
    }, {});

    const cellsBorderOptions = Object.entries(borderChanges).reduce((acc, [index, changes]) => {
      acc[index] = createGridCellElementBorderStyles(changes);

      return acc;
    }, {});

    const gridElementBorders = (component as any).getGridElementBorders({ ...gridData, cellsBorderOptions }, []);

    expect(gridElementBorders.borders).toEqual(borderOptions);
    expect(gridElementBorders.color).toEqual(color);
    expect(gridElementBorders.width).toEqual(width);
  });

});
