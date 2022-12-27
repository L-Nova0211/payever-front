import { EMPTY, of, throwError } from 'rxjs';

import { PebClientTerminalService } from '@pe/builder-client';

import { PosApi } from '../services/pos/abstract.pos.api';
import { PosEnvService } from '../services/pos/pos-env.service';

import { PebPosGuard } from './pos.guard';

describe('PebShopGuard', () => {

  let guard: PebPosGuard;
  let api: jasmine.SpyObj<PosApi>;
  let envService: jasmine.SpyObj<PosEnvService>;
  let terminalService: jasmine.SpyObj<PebClientTerminalService>;

  beforeEach(() => {

    api = jasmine.createSpyObj<PosApi>('PosApi', [
      'getSinglePos',
      'getPosList',
      'createPos',
    ]);

    envService = {
      posId: undefined,
      businessName: 'Business 1',
    } as any;

    terminalService = {
      terminal: null,
    } as any;

    guard = new PebPosGuard(api, envService, terminalService);

  });

  it('should be defined', () => {

    expect(guard).toBeDefined();

  });

  it('should check can activate', () => {

    const route = {
      firstChild: null,
      data: null,
    } as any;
    const terminalsList = [
      { _id: 'pos-001', name: 'Terminal 1', active: false },
      { _id: 'pos-002', name: 'Terminal 2', active: false },
      { _id: 'pos-003', name: 'Terminal 3', active: true },
    ];
    const terminal = {
      _id: 'pos-001',
      name: 'Terminal 1',
      active: false,
    };

    /**
     * arguments route and state are both null
     * api.getPosList returns [] (empty array)
     * api.createPos throws error
     */
    api.getSinglePos.and.returnValue(EMPTY);
    api.getPosList.and.returnValue(of([]));
    api.createPos.and.returnValue(throwError('test error'));

    (guard.canActivate(null, null) as any).subscribe(can => expect(can).toBe(false));
    expect(envService.posId).toBeUndefined();
    expect(api.getSinglePos).not.toHaveBeenCalled();
    expect(api.getPosList).toHaveBeenCalled();
    expect(api.createPos).toHaveBeenCalledWith({
      name: envService.businessName,
    });
    expect(terminalService.terminal).toBeNull();

    /**
     * route.firstChild is null
     * api.createPost returns mocked terminal
     * terminal.active is FALSE
     */
    api.createPos.and.returnValue(of(terminal));

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(envService.posId).toEqual(terminal._id);
    expect(route.data).toEqual({ terminal });
    expect(terminalService.terminal).toEqual(terminal);
    expect(api.getSinglePos).not.toHaveBeenCalled();

    /**
     * route.firstChild.firstChild is null
     * terminal.active is TRUE
     */
    route.firstChild = {
      firstChild: null,
    };
    terminal.active = true;

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(envService.posId).toEqual(terminal._id);
    expect(route.data).toEqual({ terminal });
    expect(terminalService.terminal).toEqual(terminal);
    expect(api.getSinglePos).not.toHaveBeenCalled();

    /**
     * api.getPosList returns mocked data
     */
    api.getPosList.and.returnValue(of(terminalsList));

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(envService.posId).toEqual(terminalsList[2]._id);
    expect(route.data).toEqual({ terminal: terminalsList[2] });
    expect(terminalService.terminal).toEqual(terminalsList[2]);
    expect(api.getSinglePos).not.toHaveBeenCalled();

    /**
     * route.firstChild.firstChild.params.posId is set
     * api.getSinglePos returns mocked terminal
     */
    route.firstChild.firstChild = {
      params: {
        posId: 'pos-001',
      },
    };
    api.getSinglePos.and.returnValue(of(terminal));

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(envService.posId).toEqual(terminal._id);
    expect(route.data).toEqual({ terminal });

  });

});
