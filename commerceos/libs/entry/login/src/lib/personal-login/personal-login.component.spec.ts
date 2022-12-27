import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PersonalLoginComponent } from './personal-login.component';

describe('PersonalLoginComponent', () => {
  let component: PersonalLoginComponent;
  let fixture: ComponentFixture<PersonalLoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalLoginComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
