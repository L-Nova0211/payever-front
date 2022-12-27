import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { PebFontListComponent } from './font-list.component';

describe('PebFontListComponent', () => {

  let fixture: ComponentFixture<PebFontListComponent>;
  let component: PebFontListComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebFontListComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebFontListComponent);
      component = fixture.componentInstance;
      component.formControl = new FormControl({
        fontFamily: 'Amatic SC',
        fontWeight: 400,
        italic: false,
        collapsed: undefined,
      });

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set items$ on init', () => {

    /**
     * fontFamily is Amatic SC
     */
    component.ngOnInit();
    component.items$.subscribe();

    let selectedFont = component.fontList.find(f => f.fontFamily === 'Amatic SC');

    expect(selectedFont.selected).toBe(true);

    /**
     * change selected fontFamily
     * fontFamily is Cabin
     */
    component.formControl.patchValue({
      fontFamily: 'Cabin',
      fontWeight: 700,
      italic: false,
      collapsed: false,
    });

    selectedFont = component.fontList.find(f => f.fontFamily === 'Cabin');

    expect(selectedFont.selected).toBe(true);
    expect(selectedFont.collapsed).toBe(false);
    expect(selectedFont.variants.find(v => v.value.fontWeight === 700 && !v.value.italic).selected).toBe(true);

    /**
     * emit collapse$
     */
    selectedFont = component.fontList.find(f => f.fontFamily === 'Amatic SC');
    component.collapse$.next(selectedFont);

    expect(selectedFont.collapsed).toBe(false);

    /**
     * component.formControl.value.fontFamily is typof array
     */
    component.formControl.patchValue({
      fontFamily: ['Amatic SC', 'Cabin'],
    });

    expect(component.fontList.every(f => f.selected === false)).toBe(true);

  });

  it('should track by index', () => {

    expect(component.trackByIndex(10)).toBe(10);

  });

  it('should toggle collapse', () => {

    const nextSpy = spyOn(component.collapse$, 'next');
    const selectedFont = component.fontList[1];

    component.toggleCollapse(selectedFont);

    expect(nextSpy).toHaveBeenCalledWith(selectedFont);

  });

});
