import { SiteEnv } from './site.env';

describe('SiteEnv', () => {

  let env: SiteEnv;
  let envService: any;

  beforeEach(() => {

    envService = { shopId: 'shop-001' };

    env = new SiteEnv(envService);

  });

  it('should be defined', () => {

    expect(env).toBeDefined();

  });

  it('should set/get active site', () => {

    const activeSite = { id: 'as-001' };
    const defaultSite = { id: 'ds-001' };

    // w/o activeSite
    // w/o defaultSite
    env.activeSite = null;

    expect(env.activeSite).toBeNull();
    expect(env.siteId).toBeUndefined();

    // w/ defaultSite
    env.defaultSite = defaultSite as any;
    env.activeSite = null;

    expect(env.activeSite).toBeNull();
    expect(env.siteId).toEqual(defaultSite.id);

    // w/ activeSite
    env.activeSite = activeSite as any;

    expect(env.activeSite).toEqual(activeSite as any);
    expect(env.siteId).toEqual(activeSite.id);

  });

  it('should set/get default site', () => {

    const activeSite = { id: 'as-001' };
    const defaultSite = { id: 'ds-001' };

    // w/o defaultSite
    // w/o activeSite
    env.defaultSite = null;

    expect(env.defaultSite).toBeNull();
    expect(env.siteId).toBeUndefined();

    // w/ activeSite
    env.activeSite = activeSite as any;
    env.defaultSite = defaultSite as any;

    expect(env.defaultSite).toEqual(defaultSite as any);
    expect(env.siteId).toEqual(activeSite.id);

  });

  it('should set/get siteId and siteId$', () => {

    const siteId = 'site-001';
    const nextSpy = spyOn(env[`siteIdSubject`], 'next').and.callThrough();

    env.siteId = siteId;

    expect(nextSpy).toHaveBeenCalledWith(siteId);
    expect(env.siteId).toEqual(siteId);
    env.siteIdAsync.subscribe(id => expect(id).toEqual(siteId));

  });

});
