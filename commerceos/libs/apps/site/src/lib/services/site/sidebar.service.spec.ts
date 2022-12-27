import { PebSidebarService } from './sidebar.service';

describe('PebSidebarService', () => {

  let service: PebSidebarService;

  beforeEach(() => {

    service = new PebSidebarService();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should toggle sidebar', () => {

    const nextSpy = spyOn(service.isSidebarClosed$, 'next').and.callThrough();

    // value = no
    service.toggleSidebar('no');

    expect(nextSpy).toHaveBeenCalledWith(false);
    expect(service.isSidebarClosed$.value).toBe(false);

    // value = yes
    service.toggleSidebar('yes');

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(service.isSidebarClosed$.value).toBe(true);

    // w/o value
    service.toggleSidebar();

    expect(nextSpy).toHaveBeenCalledWith(false);
    expect(service.isSidebarClosed$.value).toBe(false);

  });

  it('should create sidebar', () => {

    const id = 'sidebar';

    expect(service.createSidebar(id)).toEqual([
      {
        id: `${id}/dashboard`,
        name: 'Site Name',
        parentId: null,
        image: '/assets/icons/dashboard.png',
        children: [],
      },
      {
        id: `${id}/builder`,
        name: 'Edit',
        parentId: null,
        image: '/assets/icons/edit.png',
        children: [],
      },
      {
        id: `${id}/settings`,
        name: 'Settings',
        parentId: null,
        image: '/assets/icons/settings.png',
        children: [],
      },
      {
        id: `${id}/themes`,
        name: 'Themes',
        parentId: null,
        image: '/assets/icons/theme.png',
        children: [],
      },
    ]);

  });

});
