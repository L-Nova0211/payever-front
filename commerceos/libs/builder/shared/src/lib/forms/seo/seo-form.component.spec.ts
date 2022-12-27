import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PebSeoForm } from './seo-form.component';

describe('PebSeoForm', () => {
  let component: PebSeoForm;
  let fixture: ComponentFixture<PebSeoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PebSeoForm ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PebSeoForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
