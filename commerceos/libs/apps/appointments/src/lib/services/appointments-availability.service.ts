import { ElementRef, Injectable } from '@angular/core';

import { AppType, drawText } from '@pe/common';
import { PeGridContextMenuActionsEnum, PeGridItem, PeGridItemType, PeGridView } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';

import { PeAppointmentsAvailabilityInterface } from '../interfaces';

@Injectable()
export class PeAppointmentsAvailabilityService {
  public lastGridView: PeGridView;

  constructor(private translateService: TranslateService) { }

  public appointmentItemToGridItemMapper(
    appointmentAvailabilities: PeAppointmentsAvailabilityInterface[],
    canvas: ElementRef,
  ): PeGridItem[] {
    return appointmentAvailabilities.map((appointmentAvailability, index): PeGridItem => {
      const image = drawText(AppType.Appointments, canvas, `${appointmentAvailability.timeZone.split('/')[1]}`, '');
      const badge = appointmentAvailability.isDefault
        ? this.translateService.translate('appointments-app.badge.default_type')
        : null;

      return {
        action: {
          label: 'grid.actions.edit',
          more: true,
        },
        badge: {
          backgroundColor: null,
          color: null,
          label: badge,
        },
        columns: [
          {
            name: 'name',
            value: '',
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
        id: appointmentAvailability._id,
        image: image,
        isDraggable: true,
        title: appointmentAvailability.name,
        data: {
          isDefault: appointmentAvailability.isDefault,
        },
        type: PeGridItemType.Item,
      };
    });
  }
}
