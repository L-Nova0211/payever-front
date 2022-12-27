import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeLayoutComponent } from './pe-layout.component';

describe('LayoutComponent', () => {
  let component: PeLayoutComponent;
  let fixture: ComponentFixture<PeLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PeLayoutComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
