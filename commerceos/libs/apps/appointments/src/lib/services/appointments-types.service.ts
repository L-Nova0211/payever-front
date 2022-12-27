import { ElementRef, Injectable } from '@angular/core';

import { AppType, drawText } from '@pe/common';
import { PeGridContextMenuActionsEnum, PeGridItem, PeGridItemType, PeGridView } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';

import { PeAppointmentsTypeInterface } from '../interfaces';

@Injectable()
export class PeAppointmentsTypesService {
  public lastGridView: PeGridView;

  constructor(private translateService: TranslateService) { }

  public appointmentItemToGridItemMapper(
    appointmentTypes: PeAppointmentsTypeInterface[],
    canvas: ElementRef,
  ): PeGridItem[] {
    return appointmentTypes.map((appointmentType): PeGridItem => {
      const type = this.translateService.translate(`appointments-app.type_editor.type.${appointmentType.type}`);
      const image = drawText(AppType.Appointments, canvas, appointmentType.name, type);
      const badge = appointmentType.isDefault
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
        data: {
          isDefault: appointmentType.isDefault,
        },
        hideMenuItems: [
          {
            hide: true,
            value: PeGridContextMenuActionsEnum.Edit,
          },
        ],
        id: appointmentType._id,
        image: image,
        isDraggable: true,
        title: appointmentType.name,
        type: PeGridItemType.Item,
      };
    });
  }
}
