import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PeMessageAppearanceColorComponent } from './message-appearance-color.component';

describe('PeMessageAppearanceColorComponent', () => {

  let fixture: ComponentFixture<PeMessageAppearanceColorComponent>;
  let component: PeMessageAppearanceColorComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PeMessageAppearanceColorComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeMessageAppearanceColorComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

});
