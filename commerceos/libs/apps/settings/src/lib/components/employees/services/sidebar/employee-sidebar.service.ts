import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { EnvService, PE_ENV } from '@pe/common';
import { FolderItem, PeFoldersContextMenuEnum } from '@pe/folders';
import { TranslateService } from '@pe/i18n';

import { SETTINGS_NAVIGATION } from '../../../../misc/constants/settings-constants';
import { PositionsEnum } from '../../../../misc/enum/positions.enum';
import { TranslatedListOptionInterface } from '../../../../misc/interfaces';
import { ApiService, BusinessEnvService } from '../../../../services';
import { employeePositionsOptions } from '../../constants';
import { GroupTreeDataInterface, PositionTreeDataInterface } from '../../interfaces';
import { IGroupItemInterface } from '../../interfaces/employee-group.interface';
import { PebEmployeeDialogOpenerService } from '../employee-dialog-opener/peb-employee-dialog-opener.service';

@Injectable()
export class PebEmployeeSidebarService {
  isSidebarClosed$ = new BehaviorSubject(false);
  settingsData = SETTINGS_NAVIGATION;

  private readonly positions = employeePositionsOptions;

  constructor(
    private translateService: TranslateService,
    private apiService: ApiService,
    @Inject(EnvService) private envService: BusinessEnvService,
    private employeeDialogOpener: PebEmployeeDialogOpenerService,
    @Inject(PE_ENV) private env,
  ) {
  }

  toggleSidebar(a?: string) {
    if (a) {
      this.isSidebarClosed$.next(a === 'yes');

      return;
    }
    this.isSidebarClosed$.next(!this.isSidebarClosed$.value);
  }

  getEmployeePositionsTree(): FolderItem {
    return {
      _id: 'position',
      position: 1,
      isHideMenu: true,
      name: this.translateService.translate('pages.employees.sidebar.sections.position.title'),
      children: this.positions.map(option => this.convertPositionOptionToTreeItem(option)),
    };
  }

  private convertPositionOptionToTreeItem(
    { value, labelKey }: TranslatedListOptionInterface<PositionsEnum>,
  ): any {
    const data: PositionTreeDataInterface = {
      isFolder: false,
      category: value,
    };

    return {
      _id: labelKey,
      isHideMenu: true,
      name: this.translateService.translate(labelKey),
      image: `${this.env.custom.cdn}/icons-transactions/folder.svg`,
      editing: false,
      parentId: null,
      noToggleButton: true,
      data,
    };
  }

  convertGroupToTreeItem(groupItem: IGroupItemInterface): FolderItem<GroupTreeDataInterface> {
    const data: GroupTreeDataInterface = {
      category: groupItem.name,
      isFolder: false,
    };

    return {
      _id: groupItem._id,
      menuItems:  [
        PeFoldersContextMenuEnum.Edit,
        PeFoldersContextMenuEnum.Open,
        PeFoldersContextMenuEnum.Delete,
      ],
      position: 1,
      name: groupItem.name,
      image: `${this.env.custom.cdn}/icons-transactions/folder.svg`,
      editing: false,
      data,
    };
  }

  getEmployeeGroupsTree(groups): FolderItem {
    return {
      name: this.translateService.translate('form.create_form.groups.label'),
      _id: '1',
      position: 0,
      menuItems:  [PeFoldersContextMenuEnum.AddFolder],
      children: groups.map(option => this.convertGroupToTreeItem(option)),
    };
  }

  createEmployeeGroupFromTree(value) {
    let employeeGroup: any = this.apiService.createBusinessEmployeeGroup(this.envService.businessId, value);

    if(value.groupId) {
      employeeGroup = this.apiService.updateBusinessEmployeeGroup(
          this.envService.businessId,
          value,
          value.groupId,
        );
      }

    return employeeGroup;
  }

  updateEmployeeGroupFromTree(value) {
    return this.apiService.updateBusinessEmployeeGroup(
        this.envService.businessId,
        value,
        value._id,
      );
  }

  createEmployeeGroup() {
    this.employeeDialogOpener.dialogRef = this.employeeDialogOpener.openNewEmployeeGroupDialog();

    return this.employeeDialogOpener.dialogRef.afterClosed;
  }

  editEmployeeGroup(groupId, group) {
    this.employeeDialogOpener.dialogRef = this.employeeDialogOpener.openEditEmployeeGroupDialog(groupId, group);

    return this.employeeDialogOpener.dialogRef.afterClosed;
  }
}
