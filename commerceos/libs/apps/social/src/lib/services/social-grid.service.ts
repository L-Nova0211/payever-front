import { TitleCasePipe } from '@angular/common';
import { ElementRef, Injectable } from '@angular/core';
import moment from 'moment';

import { AppType, drawText } from '@pe/common';
import { FolderItem } from '@pe/folders';
import { PeGridContextMenuActionsEnum, PeGridItem, PeGridItemType, PeGridView } from '@pe/grid';
import { LocaleService, TranslateService } from '@pe/i18n-core';
import { PeOverlayRef } from '@pe/overlay-widget';

import { PeSocialPostInterface } from '../interfaces';

@Injectable()
export class PeSocialGridService {
  public lastGridView: PeGridView;
  public postOverlayRef: PeOverlayRef;
  public selectedFolder: FolderItem;

  constructor(
    private localeService: LocaleService,
    private titleCasePipe: TitleCasePipe,
    private translateService: TranslateService,
  ) {
    moment.locale(this.localeService.currentLocale$.value.code);
  }

  public backdropClick = () => { };

  public postsToGridItemMapper(posts: PeSocialPostInterface[], canvas: ElementRef): PeGridItem[] {
    const transformMoment = (post: PeSocialPostInterface, format: string) => {
      return this.titleCasePipe.transform(moment(post.toBePostedAt ?? post.postedAt).format(format));
    };

    return posts.map((post: PeSocialPostInterface): PeGridItem => {
      const day = transformMoment(post,'dddd');
      const date = transformMoment(post,'DD MMMM YYYY');
      const image = drawText(AppType.Social, canvas, date, day);
      const postStatus = `social-app.badges.${post.status}`;

      return {
        action: {
          label: 'grid.actions.edit',
          more: true,
        },
        badge: {
          backgroundColor: null,
          color: null,
          label: postStatus,
        },
        columns: [
          {
            name: 'name',
            value: post.content,
          },
          {
            name: 'type',
            value: this.translateService.translate(`social-app.post_editor.post_type.${post.type}`),
          },
          {
            name: 'condition',
            value: this.translateService.translate(postStatus),
          },
          {
            name: 'action',
            value: 'action',
          },
        ],
        hideMenuItems: [
          {
            hide: true,
            value: PeGridContextMenuActionsEnum.Edit,
          },
        ],
        id: post?.applicationScopeElasticId ?? post._id,
        image: image,
        isDraggable: true,
        serviceEntityId: post?.serviceEntityId ?? post._id,
        title: post.content,
        type: PeGridItemType.Item,
      };
    });
  }
}
