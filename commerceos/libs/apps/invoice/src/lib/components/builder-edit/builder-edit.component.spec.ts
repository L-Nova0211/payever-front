import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { MessageBus } from '@pe/common';

import { PeInvoiceBuilderEditComponent } from './builder-edit.component';

describe('BuilderEditComponent', () => {
  let component: PeInvoiceBuilderEditComponent;
  let fixture: ComponentFixture<PeInvoiceBuilderEditComponent>;

  const sanitizerSpy = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', {
    bypassSecurityTrustResourceUrl: 'bypassed',
  });
  const iconRegistrySpy = jasmine.createSpyObj<MatIconRegistry>('MatIconRegistry', ['addSvgIcon']);
  const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
  const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', ['emit']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PeInvoiceBuilderEditComponent ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: MatIconRegistry, useValue: iconRegistrySpy },
        { provide: DomSanitizer, useValue: sanitizerSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeInvoiceBuilderEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
