import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxsSelectSnapshotModule } from '@ngxs-labs/select-snapshot';
import { NgxsModule, Store } from '@ngxs/store';
import { of } from 'rxjs';

import { EnvService, PE_ENV, PeDestroyService } from '@pe/common';
import { PeGridQueryParamsService } from '@pe/grid';
import { MediaUrlPipe } from '@pe/media';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { ContactsService } from '@pe/shared/contacts';
import { ProductsAppState, ProductsService } from '@pe/shared/products';
import { PeDateTimePickerService } from '@pe/ui';

import { PebInvoiceGridService } from '../../routes/grid/invoice-grid.service';
import { PeInvoiceApi } from '../../services/abstract.invoice.api';
import { InvoiceApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { ContactsDialogService } from '../../services/contacts-dialog.service';
import { ProductsDialogService } from '../../services/products-dialog.service';
import { UploadMediaService } from '../../services/uploadMedia.service';

import { PeCreateInvoiceComponent } from './create-invoice.component';

describe('PeCreateInvoiceComponent', () => {
  let component: PeCreateInvoiceComponent;
  let fixture: ComponentFixture<PeCreateInvoiceComponent>;

  const peEnvMock = {
    custom: {
      cdn: 'cdn',
    },
  };
  const iconRegistrySpy = jasmine.createSpyObj<MatIconRegistry>('MatIconRegistry', ['addSvgIcon']);

  const sanitizerSpy = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
  sanitizerSpy.bypassSecurityTrustResourceUrl.and.callFake((value: string) => `${value}.bypassed`);

  const invoiceApiServiceSpy = jasmine.createSpyObj<InvoiceApiService>('InvoiceApiService', {
    getCurrencyList: of(),
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([ProductsAppState]),
        NgxsSelectSnapshotModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      declarations: [PeCreateInvoiceComponent],
      providers: [
        { provide: ChangeDetectorRef, useValue: {} },
        { provide: EnvService, useValue: {} },
        { provide: CommonService, useValue: {} },
        { provide: ProductsService, useValue: {} },
        { provide: ContactsService, useValue: {} },
        { provide: MediaUrlPipe, useValue: {} },
        { provide: PeDestroyService, useValue: {} },
        { provide: PeOverlayWidgetService, useValue: {} },
        { provide: PeDateTimePickerService, useValue: {} },
        { provide: PebInvoiceGridService, useValue: {} },
        { provide: ProductsDialogService, useValue: {} },
        { provide: ContactsDialogService, useValue: {} },
        { provide: ChangeDetectorRef, useValue: {} },
        { provide: PeInvoiceApi, useValue: {} },
        { provide: UploadMediaService, useValue: {} },
        { provide: Store, useValue: {} },
        { provide: InvoiceApiService, useValue: invoiceApiServiceSpy },
        { provide: MatIconRegistry, useValue: iconRegistrySpy },
        { provide: PeGridQueryParamsService, useValue: {} },
        { provide: DomSanitizer, useValue: sanitizerSpy },
        { provide: PE_OVERLAY_DATA, useValue: {} },
        { provide: PE_OVERLAY_CONFIG, useValue: {} },
        { provide: PE_ENV, useValue: peEnvMock },
        { provide: PeOverlayRef, useValue: {} },
        FormBuilder,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(PeCreateInvoiceComponent);
    component = fixture.componentInstance;
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('should expand panel when there is validation error', () => {
    component.invoiceForm.controls['customer'].setErrors({ incorrect: true });
    component.validateForms();

    expect(component.panelState.customer = true);
  });
});
