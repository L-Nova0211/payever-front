import { Injectable } from '@angular/core';

import { PeBuilderEditorRoutingPathsEnum } from '@pe/common';
import { FolderItem } from '@pe/folders';
import { TranslateService } from '@pe/i18n';

import { PeSubscriptionsRoutingPathsEnum } from '../enums';

@Injectable({ providedIn: 'root' })
export class PeSubscriptionsSidebarService {
  constructor(private translateService: TranslateService) { }

  public createSidebar(): FolderItem<{ link: PeSubscriptionsRoutingPathsEnum | PeBuilderEditorRoutingPathsEnum }>[] {
    return [
      {
        _id: '0',
        position: 0,
        name: this.translateService.translate('subscriptions-app.navigation.dashboard'),
        image: '../../assets/icons/dashboard.svg',
        isProtected: true,
        data: {
          link: PeBuilderEditorRoutingPathsEnum.Dashboard,
        },
      },
      {
        _id: '1',
        position: 1,
        name: this.translateService.translate('subscriptions-app.navigation.my_plans'),
        image: '../../assets/icons/programs.svg',
        isProtected: true,
        data: {
          link: PeSubscriptionsRoutingPathsEnum.Programs,
        },
      },
      {
        _id: '2',
        position: 2,
        name: this.translateService.translate('subscriptions-app.navigation.themes'),
        image: '../../assets/icons/themes.svg',
        isProtected: true,
        data: {
          link: PeBuilderEditorRoutingPathsEnum.Themes,
        },
      },
      {
        _id: '3',
        position: 3,
        name: this.translateService.translate('subscriptions-app.navigation.edit'),
        image: '../../assets/icons/edit.svg',
        isProtected: true,
        data: {
          link: PeBuilderEditorRoutingPathsEnum.BuilderEditor,
        },
      },
      {
        _id: '4',
        position: 4,
        name: this.translateService.translate('subscriptions-app.navigation.settings'),
        image: '../../assets/icons/settings.svg',
        isProtected: true,
        data: {
          link: PeBuilderEditorRoutingPathsEnum.Settings,
        },
      },
      {
        _id: '5',
        position: 5,
        name: this.translateService.translate('subscriptions-app.navigation.connect'),
        image: '../../assets/icons/connect.svg',
        isProtected: true,
        data: {
          link: PeSubscriptionsRoutingPathsEnum.Connect,
        },
      },
    ];
  }
}
