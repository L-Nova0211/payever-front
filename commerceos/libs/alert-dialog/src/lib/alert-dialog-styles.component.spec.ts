import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeAlertDialogStylesComponent } from './alert-dialog-styles.component';

describe('PeAlertDialogStylesComponent', () => {
  let component: PeAlertDialogStylesComponent;
  let fixture: ComponentFixture<PeAlertDialogStylesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeAlertDialogStylesComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeAlertDialogStylesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
