import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PeShopBuilderEditComponent } from './builder-edit.component';

describe('BuilderEditComponent', () => {
  let component: PeShopBuilderEditComponent;
  let fixture: ComponentFixture<PeShopBuilderEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PeShopBuilderEditComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeShopBuilderEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});