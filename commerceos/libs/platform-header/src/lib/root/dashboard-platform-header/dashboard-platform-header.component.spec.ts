import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PeDashboardPlatformHeaderComponent } from './dashboard-platform-header.component';

describe('PeDashboardPlatformHeaderComponent', () => {
  let component: PeDashboardPlatformHeaderComponent;
  let fixture: ComponentFixture<PeDashboardPlatformHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PeDashboardPlatformHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeDashboardPlatformHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
