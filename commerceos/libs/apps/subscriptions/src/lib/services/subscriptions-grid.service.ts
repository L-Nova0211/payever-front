import { ElementRef, Injectable } from '@angular/core';
import { share } from 'rxjs/operators';

import { AppType, drawText, MessageBus } from '@pe/common';
import { ConfirmScreenService } from '@pe/confirmation-screen';
import { FolderItem } from '@pe/folders';
import { PeGridContextMenuActionsEnum, PeGridItem, PeGridItemType, PeGridView } from '@pe/grid';

import { PeSubscriptionsPlanStatusEnum } from '../enums';
import { PeSubscriptionsPlanInterface } from '../interfaces';

@Injectable()
export class PeSubscriptionsGridService {
  public readonly confirmation$ = this.messageBus.listen<boolean>('confirm').pipe(share());
  public lastGridView: PeGridView;
  public selectedFolder: FolderItem;

  constructor(
    private confirmScreenService: ConfirmScreenService,
    private messageBus: MessageBus,
  ) { }

  public backdropClick = () => { };

  public plansToGridItemMapper(plans: PeSubscriptionsPlanInterface[], canvas: ElementRef): PeGridItem[] {
    return plans.map((plan: PeSubscriptionsPlanInterface): PeGridItem => {
      const image = drawText(AppType.Subscriptions, canvas, plan.name);
      const isActive = plan.status === PeSubscriptionsPlanStatusEnum.Active;

      return {
        action: {
          label: 'grid.context_menu.edit',
          more: true,
        },
        badge: {
          backgroundColor: null,
          color: null,
          label: isActive
            ? 'subscriptions-app.badges.active'
            : 'subscriptions-app.badges.inactive',
        },
        columns: [
          { 
            name: 'name',
            value: plan.name,
          },
          {
            name: 'plan_rate',
            value: `${'$'}${plan.totalPrice}/${plan.interval}`,
          },
          {
            name: 'total_subscribers',
            value: `${plan.subscribers.length}`,
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
        id: plan?.applicationScopeElasticId ?? plan._id,
        image: image,
        isDraggable: true,
        serviceEntityId: plan?.serviceEntityId ?? plan._id,
        title: plan.name,
        type: PeGridItemType.Item,
      };
    });
  }

  public openConfirmDialog(headings): void {
    this.confirmScreenService.show(headings, false);
  }
}
