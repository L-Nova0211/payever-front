import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PeMainMenuComponent } from './main-menu.component';

describe('PeMainMenuComponent', () => {
  let component: PeMainMenuComponent;
  let fixture: ComponentFixture<PeMainMenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PeMainMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeMainMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
