import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleListItemComponent } from './rule-list-item.component';

describe('RuleListItemComponent', () => {
  let component: RuleListItemComponent;
  let fixture: ComponentFixture<RuleListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RuleListItemComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
