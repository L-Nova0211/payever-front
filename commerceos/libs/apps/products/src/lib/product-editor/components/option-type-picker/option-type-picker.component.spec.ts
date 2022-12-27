import { NO_ERRORS_SCHEMA, Pipe } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';

import { SectionsService, VariantStorageService } from '../../services';
import { OptionTypePickerComponent } from './option-type-picker.component';

@Pipe({
  name: 'translate',
})
class TranslatePipeMock {
  transform() {}
}

describe('OptionTypePickerComponent', () => {
  let component: OptionTypePickerComponent;
  let fixture: ComponentFixture<OptionTypePickerComponent>;
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
      const variantStorageServiceSpy = jasmine.createSpyObj<VariantStorageService>('VariantStorageService', [
        'getIsEdit',
        'addNewOption',
        'getVariantId',
      ]);

      const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
        translate: 'translated',
      });

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
        declarations: [OptionTypePickerComponent, TranslatePipeMock],
        providers: [
          { provide: VariantStorageService, useValue: variantStorageServiceSpy },
          { provide: TranslateService, useValue: translateServiceSpy },
          { provide: Router, useValue: routerSpy },
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: SectionsService, useValue: sectionsService },
          { provide: EnvService, useValue: envService },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(OptionTypePickerComponent);
          component = fixture.componentInstance;

          fixture.detectChanges();
        });
    }),
  );

  it('Should be defined', () => {
    expect(component).toBeDefined();
  });
});
