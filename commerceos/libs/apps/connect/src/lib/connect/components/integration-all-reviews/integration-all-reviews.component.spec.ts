import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { mockComponent } from 'node_modules/@pe/ng-kit/src/kit/test/src/helpers/component-test-helper';
import { of } from 'rxjs';

import { TranslatePipe, TranslateService } from '@pe/i18n';

import { NavigationService } from '../../../core/services';
import { StateService } from '../../../core/services/';
import { HeaderService } from '../../../core/services/';

import { IntegrationAllReviewsComponent } from './integration-all-reviews.component';



describe('IntegrationAllReviewsComponent', () => {
  let testComponent: TestComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let component: IntegrationAllReviewsComponent;
  let stateService: any;
  let headerService: any;
  let navigationService: any;
  let router: any;

  const integrationName = 'name';
  const integration = {
    name: integrationName,
    displayOptions: {
      title: '',
    },
    installationOptions: {
    },
  };

  @Component({
    selector: 'test-component',
    template: '<connect-integration-all-reviews></connect-integration-all-reviews>',
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
        MatCardModule,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useClass: ActivatedRouteStub,
        },
        {
          provide: StateService,
          useValue: {
            getIntegration: jasmine.createSpy().and.returnValue(of(integration)),
            getBusinessId: jasmine.createSpy().and.returnValue('1'),
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
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy().and.stub(),
          },
        },
      ],
      declarations: [
        TestComponent,
        TranslatePipe,
        IntegrationAllReviewsComponent,
        mockComponent({
          selector: 'connect-integration-rating-stars',
          template: ``,
          inputs: ['readonly', 'currentRating'],
        }),
      ],
    });
  });

  beforeEach(() => {
    stateService = TestBed.get(StateService);
    headerService = TestBed.get(HeaderService);
    navigationService = TestBed.get(NavigationService);
    router = TestBed.get(Router);

    testFixture = TestBed.createComponent(TestComponent);
    testComponent = testFixture.componentInstance;
    component = testFixture.debugElement.query(By.css('connect-integration-all-reviews')).componentInstance;
    testFixture.detectChanges();
  });

  it('should receive integration', () => {
    expect(stateService.getIntegration).toHaveBeenCalledWith(integrationName);
    expect(headerService.setShortHeader).toHaveBeenCalled();
  });

  it('should call returnBack of NavigationService if handleClose is called', () => {
    component.handleClose();

    expect(navigationService.returnBack).toHaveBeenCalled();
  });

  it('should call navigate if back button is clicked', () => {
    testFixture.debugElement.query(By.css('.spec-cancel-button')).nativeElement.click();

    expect(stateService.getBusinessId).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();
  });
});
