import { PebCheckboxDirective } from './checkbox.directive';

describe('PebCheckboxDirective', () => {

  let directive: PebCheckboxDirective;
  let host: {
    checked: boolean,
    disabled: boolean,
    hostAttrDisabled: boolean,
    hostClassDisabled: boolean,
  };

  beforeEach(() => {

    host = {
      checked: true,
      disabled: false,
      hostAttrDisabled: false,
      hostClassDisabled: false,
    };

    directive = new PebCheckboxDirective(host as any);

  });

  it('should be defined', () => {

    expect(directive).toBeDefined();

  });

  it('should write value', () => {

    directive.writeValue(false);

    expect(host.checked).toBe(false);

  });

  it('should call & register on change', () => {

    const changeSpy = spyOn(directive, 'onChange').and.callThrough();
    const fn = (_: any) => { };

    directive.onChange(null);
    directive.registerOnChange(fn);
    directive.onChange(null);

    expect(changeSpy).toHaveBeenCalledWith(null);

  });

  it('should call & register on touched', () => {

    const touchSpy = spyOn(directive, 'onTouched').and.callThrough();
    const fn = () => { };

    directive.onTouched();
    directive.registerOnTouched(fn);

    expect(directive.onTouched).toEqual(fn);
    expect(touchSpy).toHaveBeenCalled();

  });

  it('should set disabled state', () => {

    directive.setDisabledState(true);

    expect(host.disabled).toBe(true);
    expect(host.hostAttrDisabled).toBe(true);
    expect(host.hostClassDisabled).toBe(true);

  });

});
