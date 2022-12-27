import { PebPageVariant, PebScreen } from '@pe/builder-core';
import { fromLocationUrlChange, getThemePageByLocation, screenFromWidthFactory } from './viewer.utils';

describe('Viewer Utils', () => {

  it('should get location url change event as observable', () => {

    const eventMock = { test: 'event' };
    const location = {
      onUrlChange: jasmine.createSpy('onUrlChange').and.callFake((callback: any) => callback(eventMock)),
    };

    fromLocationUrlChange(location as any).subscribe(res => expect(res).toEqual(eventMock));
    expect(location.onUrlChange).toHaveBeenCalled();

  });

  it('should get screen from width factory', () => {

    const thresholds = {
      [PebScreen.Desktop]: [1200, 2560],
      [PebScreen.Tablet]: [577, 1199],
      [PebScreen.Mobile]: [0, 576],
    };
    const warnSpy = spyOn(console, 'warn');

    // mobile
    expect(screenFromWidthFactory(thresholds as any)(150)).toEqual(PebScreen.Mobile);

    // tablet
    expect(screenFromWidthFactory(thresholds as any)(1000)).toEqual(PebScreen.Tablet);

    // desktop
    expect(screenFromWidthFactory(thresholds as any)(1920)).toEqual(PebScreen.Desktop);

    // error
    expect(screenFromWidthFactory(thresholds as any)(2560)).toEqual(PebScreen.Mobile);
    expect(warnSpy).toHaveBeenCalled();

  });

  it('should get theme page by location', () => {

    const theme = {
      pages: [
        {
          id: 'p-001',
          variant: PebPageVariant.Front,
        },
        {
          id: 'p-002',
          variant: PebPageVariant.Default,
        },
        {
          id: 'p-003',
          variant: PebPageVariant.Product,
        },
        {
          id: 'p-004',
          variant: PebPageVariant.Category,
        },
      ],
      routing: [
        {
          routeId: 'r-002',
          pageId: 'p-002',
          url: '/pages/p-002',
        },
      ],
      data: undefined,
    };

    // w/o data
    // location /
    expect(getThemePageByLocation(theme as any, '/')).toEqual(theme.pages[0] as any);

    // location /pages/p-002
    // w/ route
    expect(getThemePageByLocation(theme as any, '/pages/p-002')).toEqual(theme.pages[1] as any);

    // w/ data
    // w/o route
    theme.routing = [];
    theme.data = {
      productPages: '/products',
      categoryPages: '/categories',
    };

    expect(getThemePageByLocation(theme as any, '/pages/p-002')).toBeNull();

    // w/ data
    // location /products/prod-001
    expect(getThemePageByLocation(theme as any, '/products/prod-002')).toEqual(theme.pages[2] as any);

    // location /categories/cat-001
    expect(getThemePageByLocation(theme as any, '/categories/cat-001')).toEqual(theme.pages[3] as any);

    // pattern with :
    theme.data.categoryPages = '/categories/:categoryId';
    expect(getThemePageByLocation(theme as any, '/categories/cat-001')).toEqual(theme.pages[3] as any);

    // no pattern parts
    expect(getThemePageByLocation(theme as any, '')).toBeNull();

  });

});
