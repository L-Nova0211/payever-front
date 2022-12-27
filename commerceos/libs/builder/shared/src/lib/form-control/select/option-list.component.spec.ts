import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebSelectOptionListComponent } from './option-list.component';

describe('SelectOptionListComponent', () => {

  let fixture: ComponentFixture<PebSelectOptionListComponent>;
  let component: PebSelectOptionListComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebSelectOptionListComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebSelectOptionListComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should check is selected', () => {

    // typeof active != array
    // FALSE
    component.active = 'o-1';

    expect(component.isSelected('o-2')).toBe(false);

    // typeof active = array
    // TRUE
    component.active = ['o-1', 'o-3'];

    expect(component.isSelected('o-1')).toBe(true);

  });

});
