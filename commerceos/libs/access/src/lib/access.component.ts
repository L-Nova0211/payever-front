import { ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, share, shareReplay, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { PebEnvService } from '@pe/builder-core';
import { MessageBus, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { CreatePersonalFormEvent, CreatePersonalFormEventType } from '@pe/personal-form';
import { PePlatformHeaderService } from '@pe/platform-header';

import { PeAccessService } from './services/access.service';

@Component({
  selector: 'pe-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PeAccessComponent implements OnInit {

  @ViewChild('authDialogTpl') authDialogTpl: TemplateRef<any>;
  @ViewChild('registerDialogTpl') registerDialogTpl: TemplateRef<any>;

  private authDialogRef: MatDialogRef<any>;
  private registerDialogRef: MatDialogRef<any>;

  get tokenData() {
    return {
      businessId: this.pebEnvService.businessId,
    };
  }

  get appType() {
    return this.route.snapshot.firstChild.data?.appType;
  }

  constructor(
    private platformHeaderService: PePlatformHeaderService,
    private messageBus: MessageBus,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private pebEnvService: PebEnvService,
    private router: Router,
    private route: ActivatedRoute,
    private destroy$: PeDestroyService,
    private authService: PeAuthService,
    private accessService: PeAccessService,
  ) { }

  ngOnInit(): void {
    this.platformHeaderService.assignConfig({
      isShowCloseItem: this.authService.token && !this.authService.isAccessTokenExpired(),
      closeItem: {
        title: this.translateService.translate('header.menu.log_out'),
        onClick: () => {
          this.authService.clearSession();
        },
      },
      isShowShortHeader: false,
      leftSectionItems: [
        {
          title: this.translateService.translate('header.left_section_items.view'),
          icon: '#icon-apps-builder-view',
          class: 'next-shop__header-button',
          iconType: 'vector',
          iconSize: '24px',
          isActive: true,
          onClick: () => {
            const sectionItem = this.platformHeaderService.config.leftSectionItems[0];
            this.messageBus.emit(`${this.appType}.builder-view.open`, { sectionItem });
          },
        },
        {
          title: this.translateService.translate('header.left_section_items.publish'),
          icon: '#icon-apps-builder-publish',
          class: 'next-shop__header-button',
          iconType: 'vector',
          iconSize: '24px',
          onClick: (event: Event) => {
            if (this.authService.token && !this.authService.isAccessTokenExpired()) {
              const sectionItem = this.platformHeaderService.config.leftSectionItems[1];
              this.messageBus.emit(`${this.appType}.builder-publish.open`, { sectionItem, event });
            } else {
              this.openAuthDialog();
            }
          },
        },
        {
          title: this.translateService.translate('header.left_section_items.edit'),
          icon: '#icon-apps-builder-publish',
          class: 'next-shop__header-button',
          iconType: 'vector',
          iconSize: '24px',
          onClick: () => {
            const sectionItem = this.platformHeaderService.config.leftSectionItems[2];
            this.messageBus.emit(`${this.appType}.builder-edit.open`, { sectionItem });
          },
        },
        {
          title: this.translateService.translate('header.left_section_items.insert'),
          icon: '#icon-apps-builder-publish',
          class: 'next-shop__header-button',
          iconType: 'vector',
          iconSize: '24px',
          onClick: () => {
            const sectionItem = this.platformHeaderService.config.leftSectionItems[3];
            this.messageBus.emit(`${this.appType}.builder-insert.open`, { sectionItem });
          },
        },
        {
          title: this.translateService.translate('header.left_section_items.share'),
          icon: '#icon-apps-builder-publish',
          class: 'next-shop__header-button',
          iconType: 'vector',
          iconSize: '24px',
          onClick: () => {
            if (this.authService.token && !this.authService.isAccessTokenExpired()) {
              this.messageBus.emit(`${this.appType}.builder-share.open`, null);
            } else {
              this.openAuthDialog();
            }
          },
        },
      ],
    });
  }

  private openAuthDialog(): void {
    const appType = this.appType;
    if (appType) {
      this.authDialogRef = this.dialog.open(this.authDialogTpl, {
        data: { returnUrl: `/business/${this.pebEnvService.businessId}/${appType}/${this.pebEnvService.applicationId}/edit` },
        closeOnNavigation: true,
      });
    }
  }

  onSuccessLogin(): void {
    const user = this.authService.getUserData();
    if (user?.uuid) {
      this.accessService.createEmployeeAndNavigate(
        user.uuid, this.appType, this.pebEnvService.businessId, this.pebEnvService.applicationId,
      ).toPromise().then(() => this.authDialogRef?.close());
    } else {
      this.authDialogRef?.close();
    }
  }

  onRegister(): void {
    this.authDialogRef?.close();
    this.registerDialogRef = this.dialog.open(this.registerDialogTpl, {});
  }

  onPersonalFormEvent(e: CreatePersonalFormEvent): void {
    switch (e.event) {
      case CreatePersonalFormEventType.UserIsCreated:
        this.accessService.createEmployeeFromUser(this.appType, this.pebEnvService.businessId).pipe(
          tap(() => {
            this.registerDialogRef?.close();
            this.accessService.navigateToApp(this.appType, this.pebEnvService.businessId, this.pebEnvService.applicationId);
          }),
        ).subscribe();
        break;
      case CreatePersonalFormEventType.NavigateToLogin:
        this.registerDialogRef?.close();
        this.openAuthDialog();
        break;
    }
  }
}
