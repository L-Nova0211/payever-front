import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeBuilderShareComponent } from './builder-share.component';

describe('PeBuilderShareComponent', () => {
  let component: PeBuilderShareComponent;
  let fixture: ComponentFixture<PeBuilderShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeBuilderShareComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeBuilderShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
