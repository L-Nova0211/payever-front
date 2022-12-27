import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { mockComponent } from 'node_modules/@pe/ng-kit/src/kit/test/src/helpers/component-test-helper';

import { TranslatePipe, TranslateService } from '@pe/i18n';

import { IntegrationAppComponent } from './integration-app.component';

describe('IntegrationAppComponent', () => {
  let testComponent: TestComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let component: IntegrationAppComponent;

  @Component({
    selector: 'test-component',
    template: '<connect-integration-app [integration]="integration"></connect-integration-app>',
  })
  class TestComponent {
    integration: any = {
      name: '1',
      installationOptions: {
        links: [],
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
        IntegrationAppComponent,
        mockComponent({
          selector: 'swiper',
          inputs: ['useSwiperClass', 'config'],
        }),
        TranslatePipe,
      ],
    });
  });

  beforeEach(() => {
    testFixture = TestBed.createComponent(TestComponent);
    testComponent = testFixture.componentInstance;
    component = testFixture.debugElement.query(By.css('connect-integration-app')).componentInstance;
    testFixture.detectChanges();
  });

  it('should accept input param', () => {
    expect(component.integration).toEqual(testComponent.integration);
  });
});
