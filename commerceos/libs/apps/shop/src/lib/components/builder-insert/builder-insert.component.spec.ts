import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BuilderInsertComponent } from './builder-insert.component';

describe('BuilderInsertComponent', () => {
  let component: BuilderInsertComponent;
  let fixture: ComponentFixture<BuilderInsertComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BuilderInsertComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderInsertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
