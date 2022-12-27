import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { TranslatePipe, TranslateService } from '@pe/i18n';

import { IntegrationsStateService } from '../../../../shared';

import { IntegrationNewsComponent } from './integration-news.component';

describe('IntegrationNewsComponent', () => {
  let testComponent: TestComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let component: IntegrationNewsComponent;

  @Component({
    selector: 'test-component',
    template: '<connect-integration-news [integration]="integration"></connect-integration-news>',
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
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate').and.stub(),
          },
        },
        {
          provide: IntegrationsStateService,
          useValue: {
            getBusinessId: jasmine.createSpy('getBusiness').and.stub(),
          },
        },
      ],
      declarations: [
        TestComponent,
        IntegrationNewsComponent,
        TranslatePipe,
      ],
    });
  });

  beforeEach(() => {
    testFixture = TestBed.createComponent(TestComponent);
    testComponent = testFixture.componentInstance;
    component = testFixture.debugElement.query(By.css('connect-integration-news')).componentInstance;
    testFixture.detectChanges();
  });

  it('should accept input param', () => {
    expect(component.integration).toEqual(testComponent.integration);
  });
});
