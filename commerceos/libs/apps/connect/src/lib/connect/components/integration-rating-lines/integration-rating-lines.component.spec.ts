import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TranslatePipe, TranslateService } from '@pe/i18n';

import { IntegrationRatingLinesComponent } from './integration-rating-lines.component';

describe('IntegrationRatingLinesComponent', () => {
  let testComponent: TestComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let component: IntegrationRatingLinesComponent;

  @Component({
    selector: 'test-component',
    template: '<connect-integration-rating-lines [ratingsArray]="ratingsArray"></connect-integration-rating-lines>',
  })
  class TestComponent {
    ratingsArray: any = [4, 2, 9];
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
        IntegrationRatingLinesComponent,
        TranslatePipe,
      ],
    });
  });

  beforeEach(() => {
    testFixture = TestBed.createComponent(TestComponent);
    testComponent = testFixture.componentInstance;
    component = testFixture.debugElement.query(By.css('connect-integration-rating-lines')).componentInstance;
    testFixture.detectChanges();
  });

  it('should accept input param and display proper elements', () => {
    let starsDisplayed = 0;
    testComponent.ratingsArray.forEach((elem, index) => {
      starsDisplayed += index + 1;
    });
    expect(testFixture.debugElement.queryAll(By.css('.stars__line')).length).toBe(testComponent.ratingsArray.length);
    expect(testFixture.debugElement.queryAll(By.css('.stars__star')).length).toBe(starsDisplayed);
    expect(testFixture.debugElement.queryAll(By.css('.lines__item')).length).toBe(testComponent.ratingsArray.length);
  });
});
