import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';

import { AclInterface, AclOptionEnum, AppInterface } from '../../../../misc/interfaces';
import { AbstractComponent } from '../../../abstract';
import { AppAclFormOptionsEnum } from '../../enums';
import { AppAclFormInterface } from '../../interfaces';

export const APP_ACL_FORM_OPTION_TO_ACL_OPTION = {
  [AppAclFormOptionsEnum.creating]: AclOptionEnum.create,
  [AppAclFormOptionsEnum.reading]: AclOptionEnum.read,
  [AppAclFormOptionsEnum.editing]: AclOptionEnum.update,
  [AppAclFormOptionsEnum.deleting]: AclOptionEnum.delete,
};

export interface AclsServiceInitOptionsInterface {
  apps: AppInterface[];
  acls: AclInterface[];
  appControls: FormGroup;
  destroyed$: Observable<void> | Observable<boolean>;
}

export interface FormBuilderAppGroupsInterface {
  [app: string]: AppAclFormInterface;
}

const APP_ACL_FORM_OPTIONS = [
  AppAclFormOptionsEnum.creating,
  AppAclFormOptionsEnum.reading,
  AppAclFormOptionsEnum.editing,
  AppAclFormOptionsEnum.deleting,
];

@Injectable()
export class AclsService extends AbstractComponent {

  private options: AclsServiceInitOptionsInterface;
  private currentAppsData = new Map<string, AppAclFormInterface>();
  constructor(
    private translateService: TranslateService,
    private formBuilder: FormBuilder) {
    super();
  }

  init(options: AclsServiceInitOptionsInterface) {
    this.options = options;

    return this.options.apps.reduce((acc: AppInterface[], app: AppInterface) => {
      const group = this.generateAppGroup(app);

      if (!group) {
        return acc;
      }

      const control = this.formBuilder.group(group);
      this.currentAppsData.set(app.code, control.value);
      control.valueChanges.pipe(takeUntil(this.options.destroyed$))
        .subscribe((appData) => {
          this.onToggleChange(control, appData);
        });

      this.options.appControls.addControl(app.code, control);
      acc.push(app);

      return acc;
    }, [] as AppInterface[]);
  }

  getAccessMessage(appControl: FormGroup | AbstractControl): string {
    const options: string[] = this.getOptionsList(appControl);

    const isAllOptionsSetToTrue = options.every((option: string) => appControl.value[option]);
    const isAllOptionsSetToFalse = options.every((option: string) => !appControl.value[option]);

    if (isAllOptionsSetToTrue) {
      return this.translateService.translate('dialogs.new_employee.panels.app_items_rights.full_access');
    }

    if (isAllOptionsSetToFalse) {
      return this.translateService.translate('dialogs.new_employee.panels.app_items_rights.no_access');
    }

    return this.translateService.translate('dialogs.new_employee.panels.app_items_rights.custom_access');
  }

  getAcls(): AclInterface[] {
    const appGroups = this.options.appControls.value as FormBuilderAppGroupsInterface;
    const acls = Object.keys(appGroups)
      .map((appName: string) => {
        const appGroup: AppAclFormInterface = appGroups[appName];
        const acl: AclInterface = {
          microservice: appName,
          create: appGroup.creating,
          read: appGroup.reading,
          update: appGroup.editing,
          delete: appGroup.deleting,
        };

        return acl;
      });

    return acls.length ? acls : undefined;
  }

  private onToggleChange(appControl: AbstractControl, appDataCurrent: AppAclFormInterface) {
    const appDataPrevious: AppAclFormInterface = this.currentAppsData.get(appDataCurrent.code);

    const options: AppAclFormOptionsEnum[] = this.getOptionsList(appControl);
    const allOptions: AppAclFormOptionsEnum[] = [...options, AppAclFormOptionsEnum.fullAccess];
    const fullAccessOptions: AppAclFormOptionsEnum[] = [AppAclFormOptionsEnum.fullAccess];

    const isAllOptionsSetToTrue = options.every((option: string) => appDataCurrent[option]);

    const fullAccessWasEnabled = !appDataPrevious.full_access && appDataCurrent.full_access;
    const fullAccessWasDisables = appDataPrevious.full_access && !appDataCurrent.full_access;
    const fullAccessWasEnabledByOptions = !appDataPrevious.full_access && isAllOptionsSetToTrue;
    const fullAccessWasDisabledByOptions = appDataPrevious.full_access && !isAllOptionsSetToTrue;

    if (fullAccessWasEnabled) {
      this.setValueForOptions(appControl, allOptions, true);
    } else if (fullAccessWasDisables) {
      this.setValueForOptions(appControl, allOptions, false);
    } else if (fullAccessWasEnabledByOptions) {
      this.setValueForOptions(appControl, fullAccessOptions, true);
    } else if (fullAccessWasDisabledByOptions) {
      this.setValueForOptions(appControl, fullAccessOptions, false);
    }
    this.currentAppsData.set(appDataCurrent.code, appControl.value);
  }

  private getOptionsList(appControl: AbstractControl): AppAclFormOptionsEnum[] {
    return APP_ACL_FORM_OPTIONS
      .filter((option: string) => !!appControl.get(option));
  }

  private getAclOptionValueForApp(appCode: string, option: string): boolean {
    const foundAcl = this.options.acls?.find((acl: AclInterface) => acl.microservice === appCode);

    return foundAcl && foundAcl[option] || false;
  }

  private generateAppGroup(app: AppInterface): AppAclFormInterface {
    const options: string[] = APP_ACL_FORM_OPTIONS;

    if (!options.length) {
      return null;
    }
    const group: AppAclFormInterface = {
      id: app._id,
      code: app.code,
      full_access: false,
    };

    options.forEach((option: string) => {
      group[option] = this.getAclOptionValueForApp(app.code, APP_ACL_FORM_OPTION_TO_ACL_OPTION[option]);
    });

    group.full_access = options.every((option: string) => group[option]);

    return group;
  }

  private setValueForOptions(appControl: AbstractControl, options: string[], value: boolean): void {
    options.forEach((option: string) => {
      const optionControl = appControl.get(option);
      if (optionControl) {
        optionControl.setValue(value, { emitEvent: false });
      }
    });
  }
}
