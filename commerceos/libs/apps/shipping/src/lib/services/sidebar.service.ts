import { HostListener, Injectable } from '@angular/core';

import { FolderItem } from '@pe/folders';
import { PeGridSidenavService } from '@pe/grid';
import { TranslateService } from '@pe/i18n';

@Injectable({ providedIn: 'root' })
export class PebShippingSidebarService {
  isMobile = window.innerWidth <= 720;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth <= 720;
  }

  constructor(
    private translateService: TranslateService,
    private peGridSidenavService: PeGridSidenavService
  ){

  }

  toggleSidebar(val: boolean) {
    this.peGridSidenavService.toggleOpenStatus$.next(val);
  }

  createSidebar(): FolderItem<{link: string}>[] {
    return [
      {
        _id: '0',
        position: 0,
        name: this.translateService.translate('shipping-app.main_nav.profiles'),
        image: '../../assets/sidebar-icons/shipping.svg',
        isProtected: true,
        data: {
          link: 'profiles',
        },
      },
      {
        _id: '1',
        position: 1,
        name: this.translateService.translate('shipping-app.main_nav.zones'),
        image: '../../assets/sidebar-icons/shipping.svg',
        isProtected: true,
        data: {
          link: 'zones',
        },
      },
      {
        _id: '2',
        position: 2,
        name: this.translateService.translate('shipping-app.main_nav.packages'),
        image: '../../assets/sidebar-icons/shipping.svg',
        isProtected: true,
        data: {
          link: 'packages',
        },
      },
      {
        _id: '3',
        position: 3,
        name: this.translateService.translate('shipping-app.main_nav.delivery_location'),
        image: '../../assets/sidebar-icons/location-copy-3.svg',
        isProtected: true,
        data: {
          link: 'delivery-by-location',
        },
      },
      {
        _id: '4',
        position: 4,
        name: this.translateService.translate('shipping-app.main_nav.pickup_location'),
        image: '../../assets/sidebar-icons/location-copy-3.svg',
        isProtected: true,
        data: {
          link: 'pickup-by-location',
        },
      },
      {
        _id: '5',
        position: 5,
        name: this.translateService.translate('shipping-app.main_nav.slip'),
        image: '../../assets/sidebar-icons/shipping-packaging-slips.svg',
        isProtected: true,
        data: {
          link: 'packaging-slip',
        },
      },
      {
        _id: '6',
        position: 6,
        name: this.translateService.translate('shipping-app.main_nav.connect'),
        image: '../../assets/sidebar-icons/shipping-connect.svg',
        isProtected: true,
        data: {
          link: 'connect',
        },
      },
    ];
  }
}
