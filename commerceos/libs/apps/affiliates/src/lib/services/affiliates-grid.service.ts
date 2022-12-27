import { ElementRef, Injectable } from '@angular/core';
import moment from 'moment';
import { share } from 'rxjs/operators';

import { AppType, drawText, MessageBus } from '@pe/common';
import { ConfirmScreenService } from '@pe/confirmation-screen';
import { FolderItem } from '@pe/folders';
import { PeGridContextMenuActionsEnum, PeGridItem, PeGridItemType, PeGridView } from '@pe/grid';

import { PeAffiliatesProgramInterface } from '../interfaces';

@Injectable()
export class PeAffiliatesGridService {
  public readonly confirmation$ = this.messageBus.listen<boolean>('confirm').pipe(share());
  public lastGridView: PeGridView;
  public selectedFolder: FolderItem;
  
  constructor(
    private confirmScreenService: ConfirmScreenService,
    private messageBus: MessageBus,
  ) { }
  
  public backdropClick = () => { };

  public programsToGridItemMapper(programs: PeAffiliatesProgramInterface[], canvas: ElementRef): PeGridItem[] {
    const currentDate = moment(new Date());

    return programs.map((program: PeAffiliatesProgramInterface): PeGridItem => {
      const image = drawText(AppType.Affiliates, canvas, program.name);
      const startDate = moment(program.startedAt);
      const isActive = startDate.isSameOrBefore(currentDate);
      
      return {
        action: {
          label: 'grid.context_menu.edit',
          more: true,
        },
        badge: {
          backgroundColor: null,
          color: null,
          label: isActive
            ? 'affiliates-app.badges.active'
            : 'affiliates-app.badges.inactive',
        },
        columns: [
          { 
            name: 'name',
            value: program.name,
          },
          {
            name: 'assets',
            value: program?.assets,
          },
          {
            name: 'cookie',
            value: program?.cookie,
          },
          {
            name: 'action',
            value: 'action',
          },
        ],
        data: { program },
        hideMenuItems: [
          {
            hide: true,
            value: PeGridContextMenuActionsEnum.Edit,
          },
        ],
        id: program?.applicationScopeElasticId ?? program._id,
        image: image,
        isDraggable: true,
        serviceEntityId: program?.serviceEntityId ?? program._id,
        title: program.name,
        type: PeGridItemType.Item,
      };
    });
  }

  public openConfirmDialog(headings): void {
    this.confirmScreenService.show(headings, false);
  }
}
