import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderShareStyles } from './builder-share.styles';

describe('BuilderShareStyles', () => {
  let component: BuilderShareStyles;
  let fixture: ComponentFixture<BuilderShareStyles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuilderShareStyles ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderShareStyles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
