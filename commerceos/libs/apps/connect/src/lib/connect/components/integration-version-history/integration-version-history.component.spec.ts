import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { TranslatePipe, TranslateService } from '@pe/i18n';
import { mockComponent } from '@pe/ng-kit/src/kit/test/src/helpers/component-test-helper';

import { NavigationService } from '../../../core/services';
import { StateService, IntegrationService } from '../../../core/services/';
import { HeaderService } from '../../../core/services/';

import { IntegrationVersionHistoryComponent } from './integration-version-history.component';

describe('IntegrationVersionHistoryComponent', () => {
  let testComponent: TestComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let component: IntegrationVersionHistoryComponent;
  let stateService: any;
  let headerService: any;
  let navigationService: any;
  let integrationService: IntegrationService;
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

  const versions: any = [{
    _id: 1,
    version: 1,
    description: 1,
    versionDate: '',
  }];

  @Component({
    selector: 'test-component',
    template: '<connect-integration-version-history></connect-integration-version-history>',
  })
  class TestComponent {
  }

  class ActivatedRouteStub {
    snapshot = {
      paramMap: {
        get: jasmine.createSpy('getParam').and.returnValue(integrationName),
      },
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useClass: ActivatedRouteStub,
        },
        {
          provide: StateService,
          useValue: {
            getIntegration: jasmine.createSpy('getIntegration').and.returnValue(of(integration)),
            getBusinessId: jasmine.createSpy('getBusiness').and.returnValue('1'),
          },
        },
        {
          provide: HeaderService,
          useValue: {
            setShortHeader: jasmine.createSpy('setHeader').and.stub(),
          },
        },
        {
          provide: NavigationService,
          useValue: {
            returnBack: jasmine.createSpy('return').and.stub(),
          },
        },
        {
          provide: TranslateService,
          useValue: {
            translate: jasmine.createSpy('translate').and.returnValue('hello'),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('router').and.stub(),
          },
        },
        {
          provide: IntegrationService,
          useValue: {
            getIntegrationVersions: jasmine.createSpy('getVersions').and.returnValue(of(versions)),
          },
        },
      ],
      declarations: [
        TestComponent,
        TranslatePipe,
        IntegrationVersionHistoryComponent,
      ],
    });
  });

  beforeEach(() => {
    stateService = TestBed.get(StateService);
    headerService = TestBed.get(HeaderService);
    navigationService = TestBed.get(NavigationService);
    router = TestBed.get(Router);
    integrationService = TestBed.get(IntegrationService);

    testFixture = TestBed.createComponent(TestComponent);
    testComponent = testFixture.componentInstance;
    component = testFixture.debugElement.query(By.css('connect-integration-version-history')).componentInstance;
    testFixture.detectChanges();
  });

  it('should receive version', fakeAsync(() => {
    expect(stateService.getIntegration).toHaveBeenCalledWith(integrationName);
    expect(component.versions).toEqual(versions);
  }));

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
