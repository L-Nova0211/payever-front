import { TitleCasePipe } from '@angular/common';
import { ElementRef, Injectable } from '@angular/core';
import moment from 'moment';

import { AppType, drawText } from '@pe/common';
import { PeGridContextMenuActionsEnum, PeGridItem, PeGridItemType, PeGridView } from '@pe/grid';
import { LocaleService, TranslateService } from '@pe/i18n-core';

import { PeAppointmentsAppointmentInterface } from '../interfaces';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { PeUser, UserState } from '@pe/user';

@Injectable()
export class PeAppointmentsCalendarService {
  @SelectSnapshot(UserState.user) userData: PeUser;

  public lastGridView: PeGridView;

  constructor(
    private localeService: LocaleService,
    private titleCasePipe: TitleCasePipe,
    private translateService: TranslateService,
  ) {
    moment.locale(this.userData.language ?? this.localeService.currentLocale$.value.code);
  }

  public appointmentItemToGridItemMapper(appointments: any[], canvas: ElementRef): PeGridItem[] {
    return appointments.map((appointment: PeAppointmentsAppointmentInterface): PeGridItem => {
      const day = this.titleCasePipe.transform(moment(appointment.date, 'DD/MM/YYYY').format('dddd'));
      const date = this.titleCasePipe.transform(moment(appointment.date, 'DD/MM/YYYY').format('DD MMMM'));
      const image = drawText(AppType.Appointments, canvas, date, day);
      const condition = appointment.allDay
        ? 'appointments-app.appointment.title.all_day'
        : 'appointments-app.appointment.title.starting_from';
      const title = this.translateService.translate(condition).replace('{time}', appointment.time);

      return {
        action: {
          label: 'grid.actions.edit',
          more: true,
        },
        columns: [
          {
            name: 'name',
            value: '',
          },
          {
            name: 'date',
            value: `${date} - ${day}`,
          },
          {
            name: 'time',
            value: title,
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
        id: appointment?.applicationScopeElasticId ?? appointment._id,
        image: image,
        isDraggable: true,
        serviceEntityId: appointment?.serviceEntityId ?? appointment._id,
        title,
        type: PeGridItemType.Item,
      };
    });
  }
}
