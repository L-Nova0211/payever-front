import { HttpClientModule } from '@angular/common/http';
import { Component, ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { mockComponent } from 'node_modules/@pe/ng-kit/src/kit/test/src/helpers/component-test-helper';
import { of } from 'rxjs';

import { NavigationService, IntegrationService } from '../../../core/services';
import { HeaderService } from '../../../core/services/header.service';

import { IntegrationFullPageComponent } from './integration-full-page.component';


describe('IntegrationFullPageComponent', () => {
  let testComponent: TestComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let component: IntegrationFullPageComponent;
  let integrationService: any;
  let navigationService: any;
  let headerService: any;
  let store: any;
  let route: any;
  let cdr: any;

  const integrationName = 'name';
  const integration = {
    name: integrationName,
    displayOptions: {
      title: '',
    },
  };

  @Component({
    selector: 'test-component',
    template: '<connect-integration-full-page></connect-integration-full-page>',
  })
  class TestComponent {
  }

  class ActivatedRouteStub {
    snapshot = {
      paramMap: {
        get: jasmine.createSpy('route').and.returnValue(integrationName),
      },
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useClass: ActivatedRouteStub,
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
            returnBack: jasmine.createSpy('returnBack').and.stub(),
          },
        },
        {
          provide: IntegrationService,
          useValue: {
            getFullIntegration: jasmine.createSpy('getIntegration').and.returnValue(of(integration)),
          },
        },
        {
          provide: Store,
          useValue: of(),
        },
        ChangeDetectorRef,
      ],
      declarations: [
        TestComponent,
        IntegrationFullPageComponent,
        mockComponent({
          selector: 'connect-integration-title',
          inputs: ['integration'],
        }),
        mockComponent({
          selector: 'connect-integration-app',
          inputs: ['integration'],
        }),
        mockComponent({
          selector: 'connect-integration-ratings-reviews',
          inputs: ['integration'],
        }),
        mockComponent({
          selector: 'connect-integration-news',
          inputs: ['integration'],
        }),
        mockComponent({
          selector: 'connect-integration-information',
          inputs: ['integration'],
        }),
        mockComponent({
          selector: 'connect-integration-supported',
          inputs: ['integration'],
        }),
        mockComponent({
          selector: 'connect-integration-more',
          inputs: ['integration'],
        }),
      ],
    });
  });

  beforeEach(() => {
    integrationService = TestBed.get(IntegrationService);
    headerService = TestBed.get(HeaderService);
    navigationService = TestBed.get(NavigationService);
    store = TestBed.get(Store);
    route = TestBed.get(ActivatedRoute);
    cdr = TestBed.get(ChangeDetectorRef);

    testFixture = TestBed.createComponent(TestComponent);
    testComponent = testFixture.componentInstance;
    component = testFixture.debugElement.query(By.css('connect-integration-full-page')).componentInstance;
    testFixture.detectChanges();
  });

  it('should receive integration and display components', () => {
    expect(integrationService.getFullIntegration).toHaveBeenCalledWith(integrationName);

    const sub = store.subscribe(() => {
      expect(headerService.setShortHeader).toHaveBeenCalled();
      expect(route.snapshot.paramMap.get).toHaveBeenCalled();
      expect(testFixture.debugElement.query(By.css('connect-integration-title'))).not.toBeNull();
      expect(testFixture.debugElement.query(By.css('connect-integration-app'))).not.toBeNull();
      expect(testFixture.debugElement.query(By.css('connect-integration-ratings-reviews'))).not.toBeNull();
      expect(testFixture.debugElement.query(By.css('connect-integration-news'))).not.toBeNull();
      expect(testFixture.debugElement.query(By.css('connect-integration-information'))).not.toBeNull();
      expect(testFixture.debugElement.query(By.css('connect-integration-more'))).not.toBeNull();
      expect(cdr.detectChanges).toHaveBeenCalled();
      sub.unsubscribe();
    });
  });

  it('should call returnBack of NavigationService if handleClose is called', () => {
    component.handleClose();

    expect(navigationService.returnBack).toHaveBeenCalled();
  });
});
