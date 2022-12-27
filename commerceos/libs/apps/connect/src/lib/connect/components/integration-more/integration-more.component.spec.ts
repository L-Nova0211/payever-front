import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { TranslatePipe, TranslateService } from '@pe/i18n';
import { mockComponent } from '@pe/ng-kit/src/kit/test/src/helpers/component-test-helper';

import { IntegrationsStateService } from '../../../../../shared';
import { NavigationService } from '../../../core';

import { IntegrationMoreComponent } from './integration-more.component';



describe('IntegrationMoreComponent', () => {
  let testComponent: TestComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let component: IntegrationMoreComponent;
  let navigationService: NavigationService;

  const integrations: any = [{
    name: '1',
    installationOptions: {},
  }];

  @Component({
    selector: 'test-component',
    template: '<connect-integration-more [integration]="integration"></connect-integration-more>',
  })
  class TestComponent {
    integration: any = {
      name: '1',
      installationOptions: {},
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate').and.stub(),
          },
        },
        {
          provide: TranslateService,
          useValue: {
            translate: jasmine.createSpy().and.returnValue('hello'),
          },
        },
        {
          provide: IntegrationsStateService,
          useValue: {
            getCategoryIntegrations: of(integrations),
          },
        },
        {
          provide: NavigationService,
          useValue: {
            saveReturn: jasmine.createSpy('save return').and.stub(),
          },
        },
      ],
      declarations: [
        TestComponent,
        IntegrationMoreComponent,
        TranslatePipe,
        mockComponent({
          selector: 'integration-button',
          inputs: ['integration'],
          template: ``,
        }),
      ],
    });
  });

  beforeEach(() => {
    navigationService = TestBed.get(NavigationService);

    testFixture = TestBed.createComponent(TestComponent);
    testComponent = testFixture.componentInstance;
    component = testFixture.debugElement.query(By.css('connect-integration-more')).componentInstance;
    testFixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
