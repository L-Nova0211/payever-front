import { PeZoneUtils } from './zone-utils';

describe('PeZoneUtils', () => {

  it('should get bootstrap module options', () => {

    // w/o pe_zone
    expect(PeZoneUtils.getBootstrapModuleOptions()).toEqual({});

    // w/ pe_zone
    (window as any).pe_zone = { test: true };

    expect(PeZoneUtils.getBootstrapModuleOptions()).toEqual({
      ngZone: { test: true },
    });

  });

  it('should register bootstrap module', () => {

    const moduleMock = {
      injector: {
        get: jasmine.createSpy('injector.get').and.returnValue({ zone: 'new' }),
      },
    };
    const zoneMock = { zone: 'old' };

    // w/ window.pe_zone
    (window as any).pe_zone = zoneMock;

    PeZoneUtils.registerBootstrapModule(moduleMock as any);

    expect((window as any).pe_zone).toEqual(zoneMock);

    // w/o window.pe_zone
    delete (window as any).pe_zone;

    PeZoneUtils.registerBootstrapModule(moduleMock as any);

    expect((window as any).pe_zone).toEqual({ zone: 'new' });

  });

  afterEach(() => {

    delete (window as any).pe_zone;

  });

});
