import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PeSearchComponent } from './search.component';

describe('PeSearchComponent', () => {
  let component: PeSearchComponent;
  let fixture: ComponentFixture<PeSearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PeSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
