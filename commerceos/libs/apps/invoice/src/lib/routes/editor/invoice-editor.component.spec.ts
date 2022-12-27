import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxsSelectSnapshotModule } from '@ngxs-labs/select-snapshot';
import { NgxsModule } from '@ngxs/store';
import { of } from 'rxjs';

import { PebEditorState, PebPageType } from '@pe/builder-core';
import { EnvService, MessageBus } from '@pe/common';
import { ProductsAppState } from '@pe/shared/products';

import {
  PEB_GENERATOR_API_PATH,
  PEB_MEDIA_API_PATH,
  PEB_STORAGE_PATH,
  PebEditorApi,
} from '../../../../../../builder/api/src';
import { EditorSidebarTypes } from '../../../../../../builder/services/src/lib/editor.state';
import { ShopEditorSidebarTypes } from '../../../../../../builder/shop-plugins/src/lib/misc/types';
import { BUILDER_MEDIA_API_PATH, OPTIONS, PEB_INVOICE_API_PATH, PEB_INVOICE_BUILDER_API_PATH } from '../../constants';
import { PeInvoiceApi } from '../../services/abstract.invoice.api';
import { PeActualInvoiceEditor } from '../../services/actual.invoice-editor.api';

import { InvoiceEditorComponent } from './invoice-editor.component';

describe('InvoiceEditorComponent', () => {
  let fixture: ComponentFixture<InvoiceEditorComponent>;
  let component: InvoiceEditorComponent;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let state: jasmine.SpyObj<PebEditorState>;

  const theme = { id: 'theme-001' };
  const snapshot = { id: 'snap-001' };

  beforeEach(async(() => {
    const dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', ['listen', 'emit']);

    const editorApiSpy = jasmine.createSpyObj<PebEditorApi>('PebEditorApi', [
      'getShopThemeById',
      'getThemeDetail',
      'getShopActiveTheme',
      'getPage',
    ]);
    editorApiSpy.getShopThemeById.and.returnValue(of(theme) as any);
    editorApiSpy.getThemeDetail.and.returnValue(of(snapshot) as any);

    const routeMock = {
      snapshot: {
        params: {
          themeId: 'theme-001',
        },
      },
    };

    const stateMock = {
      sidebarsActivity$: of({
        [EditorSidebarTypes.Navigator]: true,
        [EditorSidebarTypes.Inspector]: true,
        [EditorSidebarTypes.Layers]: true,
      }),
      sidebarsActivity: {
        [EditorSidebarTypes.Navigator]: true,
        [EditorSidebarTypes.Inspector]: true,
        [EditorSidebarTypes.Layers]: true,
      },
      pagesView$: of(PebPageType.Master),
    };

    const envServiceMock = {
      businessData: undefined,
    };

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NgxsModule.forRoot([ProductsAppState]),
        NgxsSelectSnapshotModule,
        HttpClientTestingModule,
      ],
      declarations: [InvoiceEditorComponent],
      providers: [
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: PebEditorApi, useValue: editorApiSpy },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: PebEditorState, useValue: stateMock },
        { provide: EnvService, useValue: envServiceMock },
        { provide: PeActualInvoiceEditor, editorApiSpy },
        { provide: PeInvoiceApi, useValue: {} },
        { provide: PEB_INVOICE_BUILDER_API_PATH, useValue: {} },
        { provide: PEB_INVOICE_API_PATH, useValue: {} },
        { provide: BUILDER_MEDIA_API_PATH, useValue: {} },
        { provide: PEB_MEDIA_API_PATH, useValue: {} },
        { provide: PEB_STORAGE_PATH, useValue: {} },
        { provide: PEB_GENERATOR_API_PATH, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(InvoiceEditorComponent);
        component = fixture.componentInstance;

        messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;
        state = TestBed.inject(PebEditorState) as jasmine.SpyObj<PebEditorState>;
        messageBus.listen.and.returnValue(of(EditorSidebarTypes.Layers));
      });
  }));

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('should set value', () => {
    const value = ShopEditorSidebarTypes.EditMasterPages;
    const openSpy = spyOn<any>(component, 'onOpenPreview');

    // value = preview
    component.setValue('preview');

    expect(openSpy).toHaveBeenCalledWith(theme.id);

    // pagesView = replica
    state.pagesView = PebPageType.Replica;

    component.setValue(value);

    expect(state.pagesView).toEqual(PebPageType.Master);

    // pagesView = master
    state.pagesView = PebPageType.Master;

    component.setValue(value);

    expect(state.pagesView).toEqual(PebPageType.Replica);

    // options.disabled = FALSE
    // pagesView is the same
    OPTIONS.find(option => option.option === value).disabled = true;

    component.setValue(value);

    expect(state.pagesView).toEqual(PebPageType.Replica);
  });
});
