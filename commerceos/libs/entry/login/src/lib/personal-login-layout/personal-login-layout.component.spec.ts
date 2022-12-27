import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalLoginLayoutComponent } from './personal-login-layout.component';

describe('PersonalLoginLayoutComponent', () => {
  let component: PersonalLoginLayoutComponent;
  let fixture: ComponentFixture<PersonalLoginLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonalLoginLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalLoginLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
