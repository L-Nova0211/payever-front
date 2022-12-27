import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PeBusinessSwitcherComponent } from './business-switcher.component';

describe('PeBusinessSwitcherComponent', () => {
  let component: PeBusinessSwitcherComponent;
  let fixture: ComponentFixture<PeBusinessSwitcherComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PeBusinessSwitcherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeBusinessSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
