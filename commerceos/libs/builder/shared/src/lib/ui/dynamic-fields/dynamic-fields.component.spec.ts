import { QueryList } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';

import { PebEditorDynamicFieldComponent } from './dynamic-field.component';
import { PebEditorDynamicFieldsComponent } from './dynamic-fields.component';

describe('PebEditorDynamicFieldsComponent', () => {

  let fixture: ComponentFixture<PebEditorDynamicFieldsComponent>;
  let component: PebEditorDynamicFieldsComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebEditorDynamicFieldsComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorDynamicFieldsComponent);
      component = fixture.componentInstance;
      component.fields = new QueryList<PebEditorDynamicFieldComponent>();
      component.fields.reset([
        {
          active: false,
          even: false,
          selected: of(() => { }) as any,
        },
        {
          active: false,
          even: true,
          selected: EMPTY as any,
        },
      ]);

    });

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should select field after view init', () => {

    const selectSpy = spyOn(component, 'selectField').and.callThrough();
    const field = component.fields.toArray()[0];

    component.ngAfterViewInit();

    expect(selectSpy).toHaveBeenCalledWith(field);
    expect(field.active).toBe(true);

  });

  it('should select field', () => {

    const field = component.fields.toArray()[0];

    component.selectField(field);

    expect(component.fields.toArray()[0].active).toBe(true);

    component.selectField(field);

    expect(component.fields.toArray().filter(f => f.active)).toEqual([]);

  });

  it('should emit add', () => {

    const emitSpy = spyOn(component.add, 'emit').and.callThrough();

    component.onAdd();

    expect(emitSpy).toHaveBeenCalled();

  });

  it('should reset and emit remove', () => {

    const resetSpy = spyOn<any>(component, 'reset').and.callThrough();
    const emitSpy = spyOn(component.remove, 'emit').and.callThrough();

    component.onRemove();

    expect(resetSpy).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalled();

  });

});
