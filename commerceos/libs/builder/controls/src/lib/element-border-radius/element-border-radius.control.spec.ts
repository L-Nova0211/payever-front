import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebAbstractEditor } from '@pe/builder-abstract';

import { PebElementBorderRadiusControl } from './element-border-radius.control';


describe('PebElementBorderRadiusControl', () => {

  let fixture: ComponentFixture<PebElementBorderRadiusControl>;
  let component: PebElementBorderRadiusControl;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebElementBorderRadiusControl],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebElementBorderRadiusControl);
      component = fixture.componentInstance;
      component.component = {
        styles: { borderRadius: '13' },
      } as any;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should detect changes', () => {

    const detectSpy = spyOn(component[`cdr`], 'detectChanges');

    component.detectChanges();

    expect(detectSpy).toHaveBeenCalled();

  });

  it('should get radius', () => {

    expect(component.radius).toBe(13);

  });

});
