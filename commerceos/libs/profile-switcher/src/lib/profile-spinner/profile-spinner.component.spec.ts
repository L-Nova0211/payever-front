import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule, MatSpinner } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { getComponent } from '../../profile-switcher-spec-helpers';
import { ProfileSpinnerComponent } from '../profile-spinner/profile-spinner.component';
import { ProfileSwitcherModule } from '../profile-switcher.module';

describe('ProfileSpinnerComponent', () => {
  let component: ProfileSpinnerComponent;
  let fixture: ComponentFixture<ProfileSpinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatMenuModule, MatCardModule, MatProgressSpinnerModule, NoopAnimationsModule, ProfileSwitcherModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('passes spinnerDiameter and spinnerStroke to mat spinner',() => {
    const matSpinner = getComponent<MatSpinner>(fixture, MatSpinner);
    expect(matSpinner.diameter).toBe(component.spinnerDiameter);
    expect(matSpinner.strokeWidth).toBe(component.spinnerStroke);
  });
});
