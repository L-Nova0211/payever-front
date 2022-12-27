import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { cloneDeep, map as lodashMap } from 'lodash-es';
import { Observable } from 'rxjs';

import { FinexpHeaderAbstractService } from '@pe/finexp-app';
import { TranslateService } from '@pe/i18n';
import {
  PePlatformHeaderConfig,
  PePlatformHeaderService,
  PePlatformHeaderItem,
} from '@pe/platform-header';


import { StorageService } from './storage.service';

@Injectable()
export class HeaderService implements FinexpHeaderAbstractService { // extends AbstractService {

  constructor(
    private platformHeaderService: PePlatformHeaderService,
    private router: Router,
    private storageService: StorageService,
    private translateService: TranslateService
  ) {}

  setShortHeader(
    titleKey: string,
    onCancel: () => void,
    extraLeftButtons: PePlatformHeaderItem[] = [],
    extraRightButtons: PePlatformHeaderItem[] = []
  ): void {

    const config = {
      shortHeaderTitleItem: this.translateService.translate(titleKey),
      shortHeaderLeftMenuItems: null, // extraLeftButtons,
      shortHeaderRightMenuItems: null, // extraRightButtons,
      closeItem: {
        title: this.translateService.translate('actions.close'),
        onClick: () => onCancel(),
      },
      isShowShortHeader: true,
      isShowCloseItem: false,
    };

    extraRightButtons = [...extraRightButtons, config.closeItem];

    if (extraRightButtons && extraRightButtons.length) {
      extraRightButtons = cloneDeep(extraRightButtons);
      lodashMap(extraRightButtons, (button) => {
        const onClick = button.onClick;
        button.title = this.translateService.hasTranslation(button.title) ?
        this.translateService.translate(button.title) : button.title;
        button.onClick = () => {
          for (let i = 0; i < extraRightButtons.length; i++) {
            extraRightButtons[i].isActive = false;
          }
          button.isActive = true;
          config.shortHeaderRightMenuItems = extraRightButtons;
          this.platformHeaderService?.setConfig(config as any);
          onClick();
        };
      });
    }

    config.shortHeaderLeftMenuItems = extraLeftButtons;
    config.shortHeaderRightMenuItems = extraRightButtons;
    this.platformHeaderService?.setConfig(config as any);

    this.platformHeaderService?.setShortHeader({
      title: this.translateService.translate(titleKey),
      isActive: true,
    });
  }

  setShortHeaderWithDropdownMenu(titleKey: string, menuItems: PePlatformHeaderItem[],
    onCancel: () => void, loading$: Observable<boolean> = null): void {

    const controlMenu = [{
      // title: 'Test',
      icon: '#icon-dots-h-24',
      iconSize: '17px',
      iconType: 'vector',
      isLoading: false,
      class: 'pe-checkout-app-header-dots-icon',
      childrens: menuItems,
    }];
    const controlLoading = [{
      ...controlMenu[0],
      isLoading: true,
      childrens: null,
    }];

    this.platformHeaderService?.setConfig({
      shortHeaderTitleItem: this.translateService.translate(titleKey),
      shortHeaderRightMenuItems: controlMenu,
      closeItem: {
        title: this.translateService.translate('actions.close'),
        onClick: () => onCancel(),
      },
      isShowShortHeader: true,
      isShowCloseItem: true,
    } as any);

    this.platformHeaderService?.setShortHeader({
      title: this.translateService.translate(titleKey),
      isActive: true,
    });

    if (loading$) {
      loading$.subscribe(
        (loading) => {
          this.platformHeaderService?.assignConfig({
            shortHeaderRightMenuItems: loading ? controlLoading : controlMenu,
          } as any as PePlatformHeaderConfig);
        });
    }
  }

  hideHeader(): void {
    this.platformHeaderService.setConfig({ isHidden: true } as any);
  }
}
