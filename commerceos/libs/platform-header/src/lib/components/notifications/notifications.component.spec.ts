import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PeNotificationsComponent } from './notifications.component';

describe('PeNotificationsComponent', () => {
  let component: PeNotificationsComponent;
  let fixture: ComponentFixture<PeNotificationsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PeNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
