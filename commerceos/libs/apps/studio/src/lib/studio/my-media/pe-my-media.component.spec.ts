import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeMyMediaComponent } from './pe-my-media.component';

describe('MyMediaComponent', () => {
  let component: PeMyMediaComponent;
  let fixture: ComponentFixture<PeMyMediaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PeMyMediaComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeMyMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
