import { Injectable } from '@angular/core';

import { CustomConfigInterface, MessageBus } from '@pe/common';
import { GridTitleImageStyle } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { MediaContainerType } from '@pe/media';

import { EmployeeStatusEnum, PositionInterface } from '../../../../misc/interfaces';
import { BusinessEmployeeInterface } from '../../../../misc/interfaces/business-employees/business-employee.interface';
import { BusinessEnvService, EnvironmentConfigService } from '../../../../services';
import {
  EmployeesListStatusButtonsComponent,
} from '../../components/employees-list-status-buttons/employees-list-status-buttons.component';
import { EmployeesGridItemDataInterface } from '../../interfaces';
import { EmployeesGridItemInterface } from '../../interfaces/employees-grid-item.interface';

@Injectable()
export class PebGridDataConverterService {
  private readonly defaultUserAvatarUrl =
    `${this.configService.getCustomConfig().translation}/icons-settings/employee-default-icon.png`;

  private readonly config: CustomConfigInterface = this.configService.getCustomConfig();

  constructor(
    private configService: EnvironmentConfigService,
    private translateService: TranslateService,
    private envService: BusinessEnvService,
    private messageBus: MessageBus,
  ) {}

  convertEmployeeToGridItem(employee: BusinessEmployeeInterface): EmployeesGridItemInterface {
    const withImage = !!employee.logo;
    const userLogoUrl = `${this.config.storage}/${MediaContainerType.Images}/${employee.logo}`;
    const allPositions: PositionInterface[] = Array.isArray(employee.positions)
      ? employee.positions
      : [employee.positions];
    const employeePosition = allPositions.find(pos => pos?.businessId === this.envService.businessUuid);

    const data: EmployeesGridItemDataInterface = {
      isActive: `${employeePosition?.status}` === `${EmployeeStatusEnum.active}`,
      withoutImage: !withImage,
      position: employeePosition?.positionType,
      email: employee.email,
      status: employeePosition.status,
      actionButton: employeePosition.status === EmployeeStatusEnum.invited ? {
        color: '#ffffff',
        backgroundColor: '#0371e2',
        title: this.translateService.translate('pages.employees.datagrid.list.resend'),
        callback: (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
          this.messageBus.emit('settings.resend.employee.invitation', employee._id);
        },
      } : null,
    };

    return {
      id: employee._id,
      type: 'item',
      labelClass: `label-${data.status}`,
      badge: {
        label: this.translateService.translate(`pages.employees.datagrid.list.${EmployeeStatusEnum[data.status]}`),
        color: '#ffffff',
      },
      labels: [this.translateService.translate(`pages.employees.datagrid.list.${EmployeeStatusEnum[data.status]}`)],
      title: employee.fullName,
      position: employee.positions[0].positionType,
      mail: employee.email,
      image: withImage ? userLogoUrl : this.defaultUserAvatarUrl,
      showAbbreviation: !withImage,
      action: {
        label: this.translateService.translate('pages.employees.datagrid.list.edit'),
        color: '#ffffff',
        more: true,
      },
      columns: [
        {
          name: 'name',
          value: 'name',
        },
        {
          name: 'position',
          value: 'position',
        },
        {
          name: 'mail',
          value: 'mail',
        },
        {
          name: 'badge',
          value: 'badge',
        },
        {
          name: 'action',
          value: 'action',
        },
      ],
      customFields: [
        { content: employeePosition?.positionType || '' },
        { content: employee.email },
        {
          component: {
            component: EmployeesListStatusButtonsComponent,
            float: 'left',
          },
        },
      ],
      data,
    };
  }
}
