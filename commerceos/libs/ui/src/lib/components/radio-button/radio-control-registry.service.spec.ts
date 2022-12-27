import { TestBed } from '@angular/core/testing';

import { RadioControlRegistry } from './radio-control-registry.service';

describe('RadioControlRegistry', () => {

  let service: RadioControlRegistry;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        RadioControlRegistry,
      ],
    });

    service = TestBed.inject(RadioControlRegistry);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should add control', () => {

    const control = { id: 'ctrl-001' } as any;
    const accessor = { test: true } as any;

    service.add(control, accessor);

    expect(service[`accessors`]).toEqual([
      [control, accessor],
    ]);

  });

  it('should remove accessor', () => {

    const control = { id: 'ctrl-001' } as any;
    const accessor = { test: true } as any;

    service.add(control, accessor);
    service.remove(accessor);

    expect(service[`accessors`]).toEqual([]);

  });

  it('should select', () => {

    const sameSpy = spyOn<any>(service, 'isSameGroup').and.returnValues(false, true);
    const control = { id: 'ctrl-001' } as any;
    const accessor = {
      value: null,
      writeValue: jasmine.createSpy('writeValue'),
    } as any;

    service.add(control, accessor);

    // isSameGroup = FALSE
    service.select({ ...accessor, value: 'checked' });

    expect(accessor.writeValue).not.toHaveBeenCalled();

    // isSamgeGroup = TRUE
    service.select({ ...accessor, value: 'checked' });

    expect(accessor.writeValue).toHaveBeenCalledWith('checked');

  });

  it('should check if is same group', () => {

    const control = {
      id: 'ctrl-001',
      control: {
        root: 'test.root',
      },
    } as any;
    const accessor = {
      name: 'Name',
      control: {
        control: {
          root: 'test.root',
        },
      },
    } as any;

    // w/o control
    expect(service[`isSameGroup`]([{ control: null }, accessor] as any, accessor)).toBe(false);

    // w/ control
    expect(service[`isSameGroup`]([control, accessor], accessor)).toBe(true);

  });

});
