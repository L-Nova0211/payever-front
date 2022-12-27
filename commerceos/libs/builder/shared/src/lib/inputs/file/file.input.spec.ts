import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { requiredFileType, SidebarFileInput } from './file.input';

describe('SidebarFileInput', () => {

  let fixture: ComponentFixture<SidebarFileInput>;
  let component: SidebarFileInput;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [SidebarFileInput],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(SidebarFileInput);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should write value', () => {

    component.writeValue(null);

    expect(component[`host`].nativeElement.value).toEqual('');

  });

  it('should register on change', () => {

    const fn = () => { };

    component.registerOnChange(fn);

    expect(component.onChange).toEqual(fn);

  });

  it('should register on touched', () => {

    component.registerOnTouched(() => { });

    expect().nothing();

  });

  it('should emit blurred on change', () => {

    const fileList = {
      0: new File(['test'], 'test.jpg', { type: 'images/jpg' }),
      item(index) {
        return this[index];
      },
    };
    const emitSpy = spyOn(component.blurred, 'emit').and.callThrough();
    const event = new Event('change');

    component.registerOnChange(() => { });

    // w/o fileList
    component[`host`].nativeElement.dispatchEvent(event);

    expect(emitSpy).toHaveBeenCalled();

    // w/ fileList
    Object.defineProperty(event, 'target', {
      value: {
        files: fileList,
      },
    });

    component[`host`].nativeElement.dispatchEvent(event);

    expect(emitSpy).toHaveBeenCalled();

  });

  it('should check required file type', () => {

    const types = ['JPG', 'SVG'];
    const control = new FormControl(null, requiredFileType(types));
    let file = new File(['test'], 'test.svg', { type: 'images/svg' });

    // w/ file
    // valid
    control.setValue(file);
    expect(control.valid).toBe(true);

    // invalid
    file = new File(['test'], 'test.png', { type: 'images/png' });
    control.setValue(file);
    expect(control.valid).toBe(false);

  });

});
