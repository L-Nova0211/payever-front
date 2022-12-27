import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetLinkComponent } from './get-link.component';

describe('GetLinkComponent', () => {
  let component: GetLinkComponent;
  let fixture: ComponentFixture<GetLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GetLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
