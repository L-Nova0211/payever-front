import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';

import { TranslatePipe, TranslateService } from '@pe/i18n';

import { IntegrationRatingStarsComponent } from './integration-rating-stars.component';


describe('IntegrationRatingStarsComponent', () => {
  let testComponent: TestComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let component: IntegrationRatingStarsComponent;

  @Component({
    selector: 'test-component',
    template: `
    <connect-integration-rating-stars
      [currentRating]="currentRating"
      [maxRating]="maxRating"
      [readonly]="readonly"
      (selectRating)="selectRating($event)">
    </connect-integration-rating-stars>`,
  })
  class TestComponent {
    currentRating = 6;
    maxRating = 7;
    readonly = false;
    selectRating = jasmine.createSpy().and.stub();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
      ],
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
        IntegrationRatingStarsComponent,
        TranslatePipe,
      ],
    });
  });

  beforeEach(() => {
    testFixture = TestBed.createComponent(TestComponent);
    testComponent = testFixture.componentInstance;
    component = testFixture.debugElement.query(By.css('connect-integration-rating-stars')).componentInstance;
    testFixture.detectChanges();
  });

  it('should accept input params', () => {
    let filledCount = 0;
    let emptyCount = 0;

    testFixture.debugElement.queryAll(By.css('use')).forEach((starElem) => {
      if (starElem.nativeElement.getAttribute('xlink:href') === '#icon-filled-star') {
        filledCount++;
      } else {
        emptyCount++;
      }
    });

    expect(filledCount).toBe(testComponent.currentRating);
    expect(emptyCount).toBe(testComponent.maxRating - testComponent.currentRating);
  });

  it('should change stars array if mouseover is called', () => {
    let filledCount = 0;
    let emptyCount = 0;

    const firstStar = testFixture.debugElement.queryAll(By.css('svg'))[0];
    firstStar.nativeElement.dispatchEvent(new Event('mouseover'));
    testFixture.detectChanges();

    testFixture.debugElement.queryAll(By.css('use')).forEach((starElem) => {
      if (starElem.nativeElement.getAttribute('xlink:href') === '#icon-filled-star') {
        filledCount++;
      } else {
        emptyCount++;
      }
    });

    expect(filledCount).toBe(1);
    expect(emptyCount).toBe(testComponent.maxRating - 1);
  });

  it('should not change stars array if mouseover and mouseleave are called', () => {
    let filledCount = 0;
    let emptyCount = 0;

    const firstStar = testFixture.debugElement.queryAll(By.css('svg'))[0];
    const starsContainer = testFixture.debugElement.query(By.css('.stars'));
    firstStar.nativeElement.dispatchEvent(new Event('mouseover'));
    testFixture.detectChanges();

    starsContainer.nativeElement.dispatchEvent(new Event('mouseleave'));
    testFixture.detectChanges();

    testFixture.debugElement.queryAll(By.css('use')).forEach((starElem) => {
      if (starElem.nativeElement.getAttribute('xlink:href') === '#icon-filled-star') {
        filledCount++;
      } else {
        emptyCount++;
      }
    });

    expect(filledCount).toBe(testComponent.currentRating);
    expect(emptyCount).toBe(testComponent.maxRating - testComponent.currentRating);
  });

  it('should change stars array if click is called', () => {
    let filledCount = 0;
    let emptyCount = 0;

    const firstStar = testFixture.debugElement.queryAll(By.css('svg'))[0];
    firstStar.nativeElement.dispatchEvent(new Event('click'));
    testFixture.detectChanges();

    testFixture.debugElement.queryAll(By.css('use')).forEach((starElem) => {
      if (starElem.nativeElement.getAttribute('xlink:href') === '#icon-filled-star') {
        filledCount++;
      } else {
        emptyCount++;
      }
    });

    expect(filledCount).toBe(1);
    expect(emptyCount).toBe(testComponent.maxRating - 1);
    expect(testComponent.selectRating).toHaveBeenCalledWith(1);
  });

  it('should not react to events if readonly is true', () => {
    testComponent.readonly = true;
    testFixture.detectChanges();
    let filledCount = 0;
    let emptyCount = 0;

    const firstStar = testFixture.debugElement.queryAll(By.css('svg'))[0];
    firstStar.nativeElement.dispatchEvent(new Event('click'));
    firstStar.nativeElement.dispatchEvent(new Event('mouseover'));
    testFixture.detectChanges();

    testFixture.debugElement.queryAll(By.css('use')).forEach((starElem) => {
      if (starElem.nativeElement.getAttribute('xlink:href') === '#icon-filled-star') {
        filledCount++;
      } else {
        emptyCount++;
      }
    });

    expect(testComponent.selectRating).not.toHaveBeenCalled();
    expect(filledCount).toBe(testComponent.currentRating);
    expect(emptyCount).toBe(testComponent.maxRating - testComponent.currentRating);
  });
});
