import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { mockComponent } from 'node_modules/@pe/ng-kit/src/kit/test/src/helpers/component-test-helper';

import { TranslatePipe, TranslateService } from '@pe/i18n';

import { IntegrationTitleComponent } from './integration-title.component';

describe('IntegrationTitleComponent', () => {
  let testComponent: TestComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let component: IntegrationTitleComponent;

  @Component({
    selector: 'test-component',
    template: '<connect-integration-title [integration]="integration"></connect-integration-title>',
  })
  class TestComponent {
    integration: any = {
      name: '1',
      _status: {
        installed: true,
      },
      displayOptions: {
        icon: '',
      },
      installationOptions: {
      },
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TranslateService,
          useValue: {
            translate: jasmine.createSpy().and.returnValue('hello'),
          },
        },
      ],
      declarations: [
        TestComponent,
        IntegrationTitleComponent,
        mockComponent({
          selector: 'integration-button',
          template: ``,
          inputs: ['integration'],
        }),
        mockComponent({
          selector: 'integration-action-menu',
          template: ``,
          inputs: ['integration'],
        }),
        mockComponent({
          selector: 'connect-integration-rating-stars',
          template: ``,
          inputs: ['decimalMode', 'currentRating', 'iconClass'],
          outputs: ['selectRating'],
        }),
        TranslatePipe,
      ],
    });
  });

  beforeEach(() => {
    testFixture = TestBed.createComponent(TestComponent);
    testComponent = testFixture.componentInstance;
    component = testFixture.debugElement.query(By.css('connect-integration-title')).componentInstance;
    testFixture.detectChanges();
  });

  it('should display integration-action-menu if integration is installed', () => {
    expect(testFixture.debugElement.query(By.css('integration-action-menu'))).toBeDefined();

    testComponent.integration._status.installed = false;
    testComponent.integration = { ... testComponent.integration };
    testFixture.detectChanges();

    expect(testFixture.debugElement.query(By.css('integration-action-menu'))).toBeNull();
  });
});
