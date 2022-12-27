import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionStorageService } from 'ngx-webstorage';
import { mockComponent } from 'node_modules/@pe/ng-kit/src/kit/test/src/helpers/component-test-helper';
import { of, Subject } from 'rxjs';

import { PeAuthService } from '@pe/auth';
import { TranslateService, TranslatePipe } from '@pe/i18n';
import { FORM_DATE_ADAPTER } from '@pe/ng-kit/src/kit/form-core/constants';

import { NavigationService, IntegrationsApiService } from '../../../core/services';
import { HeaderService } from '../../../core/services/header.service';
import { IntegrationsStateService } from '../../../shared';

import { IntegrationWriteReviewComponent } from './integration-write-review.component';







describe('IntegrationWriteReviewComponent', () => {
  let testComponent: TestComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let component: IntegrationWriteReviewComponent;
  let stateService: any;
  let headerService: any;
  let navigationService: any;
  let dialog: any;
  let router: any;
  let integrationService: any;

  const integrationName = 'name';
  const integration = {
    name: integrationName,
    displayOptions: {
      title: '',
    },
    installationOptions: {
      price: '',
    },
  };

  const closedSubject = new Subject();

  @Component({
    selector: 'test-component',
    template: '<connect-integration-write-review></connect-integration-write-review>',
  })
  class TestComponent {
  }

  class ActivatedRouteStub {
    snapshot = {
      paramMap: {
        get: jasmine.createSpy().and.returnValue(integrationName),
      },
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useClass: ActivatedRouteStub,
        },
        {
          provide: IntegrationsStateService,
          useValue: {
            getIntegration: jasmine.createSpy().and.returnValue(of(integration)),
            getBusinessId: jasmine.createSpy().and.stub(),
          },
        },
        {
          provide: HeaderService,
          useValue: {
            setShortHeader: jasmine.createSpy().and.stub(),
          },
        },
        {
          provide: NavigationService,
          useValue: {
            returnBack: jasmine.createSpy().and.stub(),
          },
        },
        {
          provide: TranslateService,
          useValue: {
            translate: jasmine.createSpy().and.returnValue('hello'),
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: jasmine.createSpy('open dialog').and.returnValue({
              afterClosed: jasmine.createSpy('after closed').and.returnValue(closedSubject),
            }),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate').and.stub(),
          },
        },
        {
          provide: FORM_DATE_ADAPTER,
          useValue: 'FORM_DATE_ADAPTER',
        },
        {
          provide: SessionStorageService,
          useValue: {
            retrieve: jasmine.createSpy().and.stub(),
          },
        },
        {
          provide: IntegrationsApiService,
          useValue: {
            addIntegrationReview: jasmine.createSpy('add review').and.returnValue(of()),
          },
        },
        {
          provide: PeAuthService,
          useValue: {
            getUserData: jasmine.createSpy().and.returnValue({ uuid: '1' }),
          },
        },
      ],
      declarations: [
        TranslatePipe,
        TestComponent,
        IntegrationWriteReviewComponent,
        mockComponent({
          selector: 'pe-form-fieldset',
          inputs: ['fields', 'formGroup', 'formStyle', 'orientation'],
        }),
        mockComponent({
          selector: 'pe-info-box-confirm',
          inputs: ['title', 'subtitle', 'cancelButtonTitle', 'confirmButtonTitle'],
          outputs: ['onCancel', 'onConfirm'],
        }),
        mockComponent({
          selector: 'connect-integration-rating-stars',
          inputs: ['readonly', 'currentRating', 'iconClass'],
          outputs: ['selectRating'],
        }),
      ],
    });
  });

  beforeEach(() => {
    stateService = TestBed.get(StateService);
    headerService = TestBed.get(HeaderService);
    navigationService = TestBed.get(NavigationService);
    dialog = TestBed.get(MatDialog);
    router = TestBed.get(Router);
    integrationService = TestBed.get(IntegrationService);

    testFixture = TestBed.createComponent(TestComponent);
    testComponent = testFixture.componentInstance;
    component = testFixture.debugElement.query(By.css('connect-integration-write-review')).componentInstance;
    testFixture.detectChanges();
  });

  it('should receive integration and display form', () => {
    expect(stateService.getIntegration).toHaveBeenCalledWith(integrationName, true);
    expect(headerService.setShortHeader).toHaveBeenCalled();
    expect(testFixture.debugElement.query(By.css('form'))).toBeDefined();
    expect(component.form).toBeDefined();
  });

  it('should call returnBack of NavigationService if handleClose is called', () => {
    component.handleClose();

    expect(navigationService.returnBack).toHaveBeenCalled();
  });

  it('should open dialog if user clicks cancel', () => {
    testFixture.debugElement.query(By.css('.form-container__cancel-button')).nativeElement.click();

    expect(dialog.open).toHaveBeenCalled();
    expect(dialog.open().afterClosed).toHaveBeenCalled();

    closedSubject.next(true);

    expect(router.navigate).toHaveBeenCalled();
  });

  it('should send review and navigate if submit button is called', () => {
    testFixture.debugElement.query(By.css('.spec-submit-button')).nativeElement.disabled = null;
    testFixture.debugElement.query(By.css('.spec-submit-button')).nativeElement.click();

    expect(integrationService.addIntegrationReview).toHaveBeenCalled();
  });

  it('should set currentUserRating if selectRating is emmited', () => {
    const ratingValue = 3;
    testFixture.debugElement.query(By.css('connect-integration-rating-stars')).componentInstance.selectRating.emit(ratingValue);

    expect(component.currentUserRating).toBe(ratingValue);
  });
});
