import { of, throwError } from 'rxjs';

import { PebClientTerminalService } from '@pe/builder-client';

import { BuilderPosApi } from '../services/builder/abstract.builder-pos.api';
import { PosEnvService } from '../services/pos/pos-env.service';

import { PosThemeGuard } from './theme.guard';

describe('PosThemeGuard', () => {

  let guard: PosThemeGuard;
  let api: jasmine.SpyObj<BuilderPosApi>;
  let envService: jasmine.SpyObj<PosEnvService>;
  let terminalService: jasmine.SpyObj<PebClientTerminalService>;

  beforeEach(() => {

    api = jasmine.createSpyObj<BuilderPosApi>('BuilderPosApi', [
      'getPosPreview',
      'getTemplateThemes',
      'getTemplateItemThemes',
      'installTemplateTheme',
      'getPosPreview',
    ]);

    envService = {
      posId: null,
    } as any;

    terminalService = {
      path: null,
      theme: null,
    } as any;

    guard = new PosThemeGuard(api, envService, terminalService);

  });

  it('should be defined', () => {

    expect(guard).toBeDefined();

  });

  it('should check can activate', () => {

    const routeMock = {
      parent: {
        params: {
          posId: null,
        },
      },
      _urlSegment: {
        segments: [
          { path: 'pos' },
          { path: 'pos-001' },
          { path: 'dashboard' },
          { path: 'test' },
        ],
      },
    };

    /**
     * envService.posId is null
     * route.parent.params.posId is null
     */
    expect(() => {
      guard.canActivate(routeMock as any, null);
    }).toThrowError('There is no TERMINAL ID in the url path');
    expect(terminalService.path).toBeNull();
    expect(terminalService.theme).toBeNull();
    expect(api.getPosPreview).not.toHaveBeenCalled();
    expect(api.getTemplateThemes).not.toHaveBeenCalled();
    expect(api.getTemplateItemThemes).not.toHaveBeenCalled();
    expect(api.installTemplateTheme).not.toHaveBeenCalled();

    /**
     * route.parent.params.posId is set
     * api.getPosPreview throws error
     */
    routeMock.parent.params.posId = 'pos-001';
    api.getPosPreview.and.returnValue(throwError('test error'));

    (guard.canActivate(routeMock as any, null) as any).subscribe(can => expect(can).toBe(false));

    expect(terminalService.path).toEqual('/pos/pos-001/dashboard');
    expect(terminalService.theme).toBeNull();
    expect(api.getPosPreview).toHaveBeenCalledTimes(1);
    expect(api.getPosPreview).toHaveBeenCalledWith('pos-001');
    expect(api.getTemplateThemes).not.toHaveBeenCalled();
    expect(api.getTemplateItemThemes).not.toHaveBeenCalled();
    expect(api.installTemplateTheme).not.toHaveBeenCalled();

    /**
     * api.getPosPreview returns mocked data { current: { _id: 't-001' } }
     */
    api.getPosPreview.calls.reset();
    api.getPosPreview.and.returnValue(of({ current: { _id: 't-001' } }) as any);

    (guard.canActivate(routeMock as any, null) as any).subscribe(can => expect(can).toBe(true));

    expect(terminalService.theme).toEqual({ _id: 't-001' });
    expect(api.getPosPreview).toHaveBeenCalledTimes(1);
    expect(api.getPosPreview).toHaveBeenCalledWith('pos-001');
    expect(api.getTemplateThemes).not.toHaveBeenCalled();
    expect(api.getTemplateItemThemes).not.toHaveBeenCalled();
    expect(api.installTemplateTheme).not.toHaveBeenCalled();

    /**
     * api.getPosPreview returns mocked data { current: null }
     */
    api.getPosPreview.calls.reset();
    api.getPosPreview.and.returnValue(of({ current: null }) as any);
    api.getTemplateThemes.and.returnValue(of([{
      items: [{ id: 'item-001' }],
    }]));
    api.getTemplateItemThemes.and.returnValue(of({
      themes: [{ id: 't-001' }],
    }));
    api.installTemplateTheme.and.returnValue(of(null));

    (guard.canActivate(routeMock as any, null) as any).subscribe(can => expect(can).toBe(false));

    expect(terminalService.theme).toBeNull();
    expect(api.getPosPreview).toHaveBeenCalledTimes(2);
    expect(api.getPosPreview).toHaveBeenCalledWith('pos-001');
    expect(api.getTemplateThemes).toHaveBeenCalled();
    expect(api.getTemplateItemThemes).toHaveBeenCalledWith('item-001');
    expect(api.installTemplateTheme).toHaveBeenCalledWith('pos-001', 't-001');

  });

});
