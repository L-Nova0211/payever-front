import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TranslatePipe, TranslateService } from '@pe/i18n';

import { IntegrationInformationComponent } from './integration-information.component';

describe('IntegrationInformationComponent', () => {
  let testComponent: TestComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let component: IntegrationInformationComponent;

  @Component({
    selector: 'test-component',
    template: '<connect-integration-information [integration]="integration"></connect-integration-information>',
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
          provide: TranslateService,
          useValue: {
            translate: jasmine.createSpy().and.returnValue('hello'),
          },
        },
      ],
      declarations: [
        TestComponent,
        IntegrationInformationComponent,
        TranslatePipe,
      ],
    });
  });

  beforeEach(() => {
    testFixture = TestBed.createComponent(TestComponent);
    testComponent = testFixture.componentInstance;
    component = testFixture.debugElement.query(By.css('connect-integration-information')).componentInstance;
    testFixture.detectChanges();
  });

  it('should accept input param', () => {
    expect(component.integration).toEqual(testComponent.integration);
  });
});
