import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TranslatePipe, TranslateService } from '@pe/i18n';

import { IntegrationSupportedComponent } from './integration-supported.component';

describe('IntegrationSupportedComponent', () => {
  let testComponent: TestComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let component: IntegrationSupportedComponent;

  @Component({
    selector: 'test-component',
    template: '<connect-integration-supported [integration]="integration"></connect-integration-supported>',
  })
  class TestComponent {
    integration: any = {
      name: '1',
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
        IntegrationSupportedComponent,
        TranslatePipe,
      ],
    });
  });

  beforeEach(() => {
    testFixture = TestBed.createComponent(TestComponent);
    testComponent = testFixture.componentInstance;
    component = testFixture.debugElement.query(By.css('connect-integration-supported')).componentInstance;
    testFixture.detectChanges();
  });

  it('should accept input param', () => {
    expect(component.integration).toEqual(testComponent.integration);
  });
});
