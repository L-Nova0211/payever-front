import { TestBed } from '@angular/core/testing';

import { PlatformAbstractService } from './platform-abstract.service';

describe('PlatformAbstractService', () => {

  let platformAbstractService: any;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        PlatformAbstractService,
      ],
    });

    platformAbstractService = TestBed.get(PlatformAbstractService);
  });

  it('dispatchEvent should dispatch event', () => {
    const windowSpy = spyOn(window, 'dispatchEvent').and.stub();
    const event = {
      target: 'target',
      action: 'action',
      data: 'data',
    };

    platformAbstractService.dispatchEvent(event);

    expect(windowSpy).toHaveBeenCalled();
    expect(windowSpy.calls.first().args[0] instanceof CustomEvent).toBeTruthy();
    expect(windowSpy.calls.first().args[0].detail).toBe(`pe:os:${event.target}:${event.action}:${event.data}`);
  });
});
