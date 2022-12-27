import { NO_ERRORS_SCHEMA, Pipe } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EnvService } from '@pe/common';
import { ErrorBag } from '@pe/forms-core';
import { TranslateService } from '@pe/i18n-core';

import { SectionsService, VariantStorageService } from '../../services';
import { ColorPickerComponent } from './color-picker.component';

@Pipe({
  name: 'translate',
})
class TranslatePipeMock {
  transform() {}
}

describe('ColorPickerComponent', () => {
  let component: ColorPickerComponent;
  let fixture: ComponentFixture<ColorPickerComponent>;
  let activatedRoute: {
    snapshot: {
      params: {
        productId: string;
      };
    };
  };
  let sectionsService: {
    resetState$: {
      next: jasmine.Spy;
    };
  };

  const envService = { businessId: 'b-001' };

  beforeEach(
    waitForAsync(() => {
      const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
        translate: 'translated',
      });

      const variantStorageServiceSpy = jasmine.createSpyObj<VariantStorageService>('VariantStorageService', [
        'setNewVariantColor',
        'getIsEdit',
        'getVariantId',
      ]);

      const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

      activatedRoute = {
        snapshot: {
          params: {
            productId: null,
          },
        },
      };

      sectionsService = {
        resetState$: {
          next: jasmine.createSpy('next'),
        },
      };

      TestBed.configureTestingModule({
        declarations: [ColorPickerComponent, TranslatePipeMock],
        providers: [
          FormBuilder,
          { provide: ErrorBag, useValue: null },
          { provide: TranslateService, useValue: translateServiceSpy },
          { provide: VariantStorageService, useValue: variantStorageServiceSpy },
          { provide: Router, useValue: routerSpy },
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: EnvService, useValue: envService },
          { provide: SectionsService, useValue: sectionsService },
          { provide: 'FORM_DATE_ADAPTER', useValue: null },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(ColorPickerComponent);
          component = fixture.componentInstance;

          fixture.detectChanges();
        });
    }),
  );

  it('Should be defined', () => {
    expect(component).toBeDefined();
  });
});
