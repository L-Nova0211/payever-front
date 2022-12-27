import { ElementRef, Injectable } from '@angular/core';
import moment from 'moment';
import { share } from 'rxjs/operators';

import { AppType, drawText, MessageBus } from '@pe/common';
import { Headings } from '@pe/confirmation-screen';
import { FolderItem } from '@pe/folders';
import { PeGridContextMenuActionsEnum, PeGridItem, PeGridItemType, PeGridView } from '@pe/grid';

import { PeCouponsStatusEnum } from '../enums';
import { PeCouponInterface } from '../interfaces';

@Injectable()
export class PeCouponsGridService {
  public readonly confirmation$ = this.messageBus.listen<boolean>('confirm').pipe(share());
  public lastGridView: PeGridView;
  public selectedFolder: FolderItem;

  constructor(private messageBus: MessageBus) { }

  public backdropClick = () => { }

  public couponsToGridItemMapper(coupons: PeCouponInterface[], canvas: ElementRef): PeGridItem[] {
    const currentDate = moment(new Date());

    return coupons.map((coupon: PeCouponInterface): PeGridItem => {
      const image = drawText(AppType.Coupons, canvas, coupon.code);
      const startDate = moment(coupon.startDate);
      const endDate = moment(coupon.endDate);
      const isActive = startDate.isSameOrBefore(currentDate)
        && (endDate.isValid()
          ? endDate.isSameOrAfter(currentDate)
          : true);
      const status = isActive ? PeCouponsStatusEnum.Active : PeCouponsStatusEnum.Inactive;

      return {
        action: {
          label: 'grid.actions.edit',
          more:true,
        },
        badge: {
          backgroundColor:  null,
          color:  null,
          label: status,
        },
        columns: [
          {
            name: 'name',
            value: coupon.code,
          },
          {
            name: 'description',
            value: coupon.description,
          },
          {
            name: 'condition',
            value: status,
          },
          {
            name: 'action',
            value: 'action',
          },
        ],
        description: coupon.description,
        hideMenuItems: [
          {
            hide: true,
            value: PeGridContextMenuActionsEnum.Edit,
          },
        ],
        id: coupon.serviceEntityId || coupon._id,
        image: image,
        isDraggable: true,
        title: coupon.code,
        type: PeGridItemType.Item,
      };
    });
  }

  public openConfirmDialog(headings: Headings): void {
      this.messageBus.emit('open-confirm', headings);
  }
}
