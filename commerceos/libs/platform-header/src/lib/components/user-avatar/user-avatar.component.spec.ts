import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PeUserAvatarComponent } from './user-avatar.component';

describe('PeUserAvatarComponent', () => {
  let component: PeUserAvatarComponent;
  let fixture: ComponentFixture<PeUserAvatarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PeUserAvatarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeUserAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
