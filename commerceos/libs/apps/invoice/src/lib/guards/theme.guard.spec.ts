import { of } from 'rxjs';

import { ThemesApi } from '@pe/themes';

import { PebEditorApi } from '../../../../../builder/api/src/lib/editor/abstract.editor.api';
import { InvoiceEnvService } from '../services/invoice-env.service';

import { InvoiceThemeGuard } from './theme.guard';

describe('InvoiceThemeGuard', () => {

  let guard: InvoiceThemeGuard;
  let api: jasmine.SpyObj<PebEditorApi>;
  let themesApi: jasmine.SpyObj<ThemesApi>;
  let envService: jasmine.SpyObj<InvoiceEnvService>;

  beforeEach(() => {

    api = jasmine.createSpyObj<PebEditorApi>('PebEditorApi', ['getShopActiveTheme']);

    themesApi = jasmine.createSpyObj<ThemesApi>(
      'PebThemesApi',
      ['createApplicationTheme'],
    ) as jasmine.SpyObj<ThemesApi>;

    envService = {
    } as jasmine.SpyObj<InvoiceEnvService>;

    guard = new InvoiceThemeGuard(api, themesApi, envService);

  });

  it('should be defined', () => {

    expect(guard).toBeDefined();

  });

  it('should check can activate', () => {

    const route = {
      parent: {
        params: {
        },
      },
    } as any;
    const activeTheme = {
      id: 'theme-001',
      theme: {},
      isActive: true,
      isDestroyed: false,
    };

    // w/ result.id
    route.parent.params.shopId = 'shop-001';

    api.getShopActiveTheme.and.returnValue(of(activeTheme) as any);

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(themesApi.createApplicationTheme).not.toHaveBeenCalled();

    // w/o result.id
    activeTheme.id = undefined;
    themesApi.createApplicationTheme.and.returnValue(of({ ...activeTheme, id: 'created.theme' }));

    (guard.canActivate(route, null) as any).subscribe(can => expect(can).toBe(true));
    expect(themesApi.createApplicationTheme).toHaveBeenCalled();

  });

});
