import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { AppThemeEnum, AppType, EnvService, PreloaderState } from '@pe/common';
import { DockerItemInterface, DockerState } from '@pe/docker';
import { ContactsAppState } from '@pe/shared/contacts';

import { PeContactsHeaderService } from '../services';

@Component({
  selector: 'pe-contacts-root',
  templateUrl: './contacts-root.component.html',
  styleUrls: ['./contacts-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CosContactsRootComponent implements OnInit, OnDestroy {
  @SelectSnapshot(ContactsAppState.popupMode) popupMode: boolean;
  @SelectSnapshot(DockerState.dockerItems) dockerItems: DockerItemInterface[];
  @SelectSnapshot(PreloaderState.loading) loading: {};

  public readonly theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  constructor(
    private envService: EnvService,
    private peContactsHeaderService: PeContactsHeaderService,
  ) { }

  get isGlobalLoading(): boolean {
    return this.loading[AppType.Contacts];
  }

  ngOnDestroy(): void {
    this.peContactsHeaderService.destroy();
  }

  ngOnInit(): void {
    (window as any).PayeverStatic.IconLoader.loadIcons([
      'apps',
      'set',
    ]);
    if (!this.popupMode) {
      this.peContactsHeaderService.init();
    }
  }
}
