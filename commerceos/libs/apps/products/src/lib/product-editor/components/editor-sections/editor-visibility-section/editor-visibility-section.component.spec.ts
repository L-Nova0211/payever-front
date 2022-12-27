import { NO_ERRORS_SCHEMA, Pipe } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ErrorBag } from '@pe/forms';

import { Subject } from 'rxjs';

import { ProductModel } from '../../../../shared/interfaces/product.interface';
import { SectionsService } from '../../../services';
import { CountryService } from '../../../services/country.service';
import { EditorVisibilitySectionComponent } from './editor-visibility-section.component';

@Pipe({
  name: 'translate',
})
class TranslatePipeMock {
  transform() {}
}

describe('EditorVisibilitySectionComponent', () => {
  let component: EditorVisibilitySectionComponent;
  let fixture: ComponentFixture<EditorVisibilitySectionComponent>;
  let sectionsService: {
    visibilitySection: {
      active: boolean;
    };
    onChangeVisibilitySection: jasmine.Spy;
    onFindError: jasmine.Spy;
  };
  let countryService: {
    updatedCountry$: Subject<ProductModel>;
  };

  beforeEach(
    waitForAsync(() => {
      sectionsService = {
        visibilitySection: {
          active: true,
        },
        onChangeVisibilitySection: jasmine.createSpy('onChangeVisibilitySection '),
        onFindError: jasmine.createSpy('onFindError'),
      };

      countryService = {
        updatedCountry$: new Subject(),
      };

      TestBed.configureTestingModule({
        declarations: [EditorVisibilitySectionComponent, TranslatePipeMock],
        providers: [
          FormBuilder,
          { provide: ErrorBag, useValue: null },
          { provide: SectionsService, useValue: sectionsService },
          { provide: CountryService, useValue: countryService },
          { provide: 'FORM_DATE_ADAPTER', useValue: null },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(EditorVisibilitySectionComponent);
          component = fixture.componentInstance;

          fixture.detectChanges();
        });
    }),
  );

  it('Should be defined', () => {
    expect(component).toBeDefined();
  });

  it('onUpdateFormData should update data in section service', () => {
    sectionsService.onChangeVisibilitySection.calls.reset();
    component.form.setValue({ active: true });

    expect(sectionsService.onChangeVisibilitySection).toHaveBeenCalledWith({ active: true });
  });

  it('onSubmit should notify sectionService', () => {
    component.onSubmit();

    expect(sectionsService.onFindError).toHaveBeenCalled();
  });
});
