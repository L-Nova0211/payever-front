import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';

import { PebEnvService } from '@pe/builder-core';
import { AppThemeEnum } from '@pe/common';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { ThemesApi } from '@pe/themes';

@Component({
  selector: 'pe-message-theme-overlay',
  templateUrl: './message-theme-overlay.component.html',
  styleUrls: ['./message-theme-overlay.component.scss'],
})
export class PeMessageThemeComponent implements OnInit, OnDestroy {
  previousHeaderConfig!: PePlatformHeaderConfig;
  theme: AppThemeEnum;

  readonly destroy$ = new Subject<void>();

  constructor(
    @Optional() private platformHeaderService: PePlatformHeaderService,
    private themesApi: ThemesApi,
    private envService: PebEnvService,
    private dialogRef: MatDialogRef<PeMessageThemeComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogData: any,
  ) {
    this.themesApi.applicationId = this.envService.businessId;
    this.theme = this.dialogData.theme;
  }

  ngOnInit(): void {
    this.createHeader();
  }

  ngOnDestroy(): void {
    if (this.previousHeaderConfig) {
      this.platformHeaderService.setConfig(this.previousHeaderConfig);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  createHeader(): void {
    this.previousHeaderConfig = this.platformHeaderService.config;
    const headerConfig: PePlatformHeaderConfig = {
      rightSectionItems: [
        {
          title: 'Close',
          class: 'message-close-button',
          onClick: () => this.dialogRef.close(false),
        },
      ],
    };
    this.platformHeaderService.setConfig(headerConfig);
  }
}
