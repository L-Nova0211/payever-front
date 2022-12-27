import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { mockComponent } from 'node_modules/@pe/ng-kit/src/kit/test/src/helpers/component-test-helper';
import { of } from 'rxjs';

import { TranslatePipe, TranslateService } from '@pe/i18n';
import { PeAuthService } from '@pe/ng-kit/src/kit/auth';

import { IntegrationsStateService, IntegrationsApiService } from '../../../../shared';

import { IntegrationRatingsReviewsComponent } from './integration-ratings-reviews.component';

describe('IntegrationRatingsReviewsComponent', () => {
  let testComponent: TestComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let component: IntegrationRatingsReviewsComponent;
  let stateService: any;
  let router: any;
  let dialog: any;
  let integrationService: any;

  @Component({
    selector: 'test-component',
    template: '<connect-integration-ratings-reviews [integration]="integration"></connect-integration-ratings-reviews>',
  })
  class TestComponent {
    integration: any = {
      category: 'hello',
      name: '1',
      _status: {
        installed: true,
      },
      reviews: [{}, {}],
    };
  }

  const businessId = 'id';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatCardModule,
      ],
      providers: [
        {
          provide: TranslateService,
          useValue: {
            translate: jasmine.createSpy().and.returnValue('hello'),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy().and.stub(),
          },
        },
        {
          provide: IntegrationsStateService,
          useValue: {
            getBusinessId: jasmine.createSpy().and.returnValue(businessId),
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: jasmine.createSpy().and.stub(),
          },
        },
        {
          provide: IntegrationsApiService,
          useValue: {
            rateIntegration: jasmine.createSpy().and.returnValue(of()),
          },
        },
        {
          provide: Store,
          useValue: of(),
        },
        {
          provide: PeAuthService,
          useValue: {
            getUserData: jasmine.createSpy().and.returnValue({ uuid: '1' }),
          },
        },
      ],
      declarations: [
        TestComponent,
        IntegrationRatingsReviewsComponent,
        TranslatePipe,
        mockComponent({
          selector: 'connect-integration-rating-lines',
          inputs: ['ratingsArray'],
        }),
        mockComponent({
          selector: 'connect-integration-rating-stars',
          inputs: ['readonly', 'currentRating', 'iconClass'],
          outputs: ['selectRating'],
        }),
        mockComponent({
          selector: 'pe-info-box-confirm',
          template: ``,
          inputs: ['title', 'subtitle', 'cancelButtonTitle', 'confirmButtonTitle'],
          outputs: ['onConfirm'],
        }),
      ],
    });
  });

  beforeEach(() => {
    stateService = TestBed.get(IntegrationsStateService);
    router = TestBed.get(Router);
    dialog = TestBed.get(MatDialog);
    integrationService = TestBed.get(IntegrationService);

    testFixture = TestBed.createComponent(TestComponent);
    testComponent = testFixture.componentInstance;
    component = testFixture.debugElement.query(By.css('connect-integration-ratings-reviews')).componentInstance;
    testFixture.detectChanges();
  });

  it('should accept input param', () => {
    expect(component.integration).toEqual(testComponent.integration);
  });

  it('should navigate to write review if user clicks on write review link', () => {
    testFixture.debugElement.query(By.css('.rating-bar__link')).nativeElement.click();

    expect(stateService.getBusinessId).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(
      [`business/${businessId}/connect/${testComponent.integration.category}/integrations/${testComponent.integration.name}/write-review`]
    );
  });

  it('should navigate to all reviews if user clicks on see all link', () => {
    testFixture.debugElement.query(By.css('.rating-reviews__link')).nativeElement.click();

    expect(stateService.getBusinessId).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(
      [`business/${businessId}/connect/${testComponent.integration.category}/integrations/${testComponent.integration.name}/reviews`]
    );
  });

  it('should call selectRating if selectRating from rating comp is emmited', () => {
    const rating = 4;
    const selectSpy = spyOn(component, 'selectRating').and.callThrough();
    testFixture.debugElement.query(By.css('connect-integration-rating-stars')).componentInstance.selectRating.emit(rating);

    expect(selectSpy).toHaveBeenCalledWith(rating);
    expect(integrationService.rateIntegration).toHaveBeenCalled();
  });
});
