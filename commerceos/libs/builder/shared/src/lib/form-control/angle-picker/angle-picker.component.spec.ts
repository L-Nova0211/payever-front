import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { AnglePickerComponent } from './angle-picker.component';

describe('AnglePickerComponent', () => {

  let fixture: ComponentFixture<AnglePickerComponent>;
  let component: AnglePickerComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [AnglePickerComponent,],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(AnglePickerComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();

    });

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should update value and rotate circle after view init', () => {

    const spy = spyOn<any>(component, 'updateValueAndRotateCircle');

    component.ngAfterViewInit();

    expect(spy).toHaveBeenCalledWith(0);

  });

  it('should calculate and update angle if changed on event after init', () => {

    const mousedown = new MouseEvent('mousedown', {
      button: 0,
    });
    const mousemove = new MouseEvent('mousemove');
    const mouseup = new MouseEvent('mouseup');
    const calculateSpy = spyOn<any>(component, 'calculateAndUpdateAngleIfChanged');
    const centerSpy = spyOn<any>(component, 'calculateCircleCenter').and.callThrough();

    Object.defineProperties(mousemove, {
      pageX: { value: 30 },
      pageY: { value: 30 },
    });

    component.registerOnTouched(() => { });
    component.ngAfterViewInit();

    const touchSpy = spyOn(component, 'onTouch');

    (component[`element`].nativeElement as HTMLElement).dispatchEvent(mousedown);
    document.dispatchEvent(mousemove);
    document.dispatchEvent(mouseup);

    expect(centerSpy).toHaveBeenCalled();
    expect(touchSpy).toHaveBeenCalled();
    expect(calculateSpy).toHaveBeenCalledWith(30, 30);

  });

  it('should set disabled state', () => {

    component.setDisabledState(true);

    expect(component[`disabled`]).toBe(true);

  });

  it('should write value', () => {

    const updateSpy = spyOn<any>(component, 'updateValueAndRotateCircle');

    component.writeValue(110);

    expect(updateSpy).toHaveBeenCalledWith(110);

  });

  it('should calculate and update angle if changed', () => {

    const controlMock = new FormControl();
    const dispatchEventSpy = spyOn(component[`element`].nativeElement, 'dispatchEvent');
    const updateSpy = spyOn<any>(component, 'updateValueAndRotateCircle');

    component.ngControl = { control: controlMock } as any;
    component.registerOnChange(() => { });

    const changeSpy = spyOn(component, 'onChange');

    // value = angle
    component[`calculateAndUpdateAngleIfChanged`](0, 0);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(changeSpy).not.toHaveBeenCalled();
    expect(dispatchEventSpy).not.toHaveBeenCalled();

    // value != angle
    // angle < 0
    component[`calculateAndUpdateAngleIfChanged`](50, 88);

    expect(updateSpy).toHaveBeenCalledWith(300);
    expect(changeSpy).toHaveBeenCalledWith(300);
    expect(component.ngControl.control.value).toBe(300);
    expect(dispatchEventSpy).toHaveBeenCalled();

    // angle > 0
    component[`calculateAndUpdateAngleIfChanged`](50, -88);

    expect(updateSpy).toHaveBeenCalledWith(60);
    expect(changeSpy).toHaveBeenCalledWith(60);
    expect(component.ngControl.control.value).toBe(60);

  });

  it('should update value and rotate circle', () => {

    // w/ circle
    component[`updateValueAndRotateCircle`](270);

    expect(component.value).toEqual(270);
    expect(component.circle.nativeElement.style.transform).toEqual('rotate(-270deg)');

    // w/o circle
    component.circle = undefined;
    component[`updateValueAndRotateCircle`](100);

  });

});
