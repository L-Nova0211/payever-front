import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebElementCoordsControl } from './element-coords.control';

describe('PebEditorElementCoordsControl', () => {

  let fixture: ComponentFixture<PebElementCoordsControl>;
  let component: PebElementCoordsControl;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebElementCoordsControl],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebElementCoordsControl);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle ng init', () => {

    component.spaceWidth = 120;
    component.ngOnInit();

    expect(component.margin).toEqual('0 120px');
    expect(component.width).toBe(960);

  });

  it('should detect changes', () => {

    const detectSpy = spyOn(component[`cdr`], 'detectChanges');

    component.detectChanges();

    expect(detectSpy).toHaveBeenCalled();

  });

});
