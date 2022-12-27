import {
  Component, OnInit, ChangeDetectionStrategy, ViewChild, OnDestroy, ChangeDetectorRef,
  ViewEncapsulation,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select, Store } from '@ngxs/store';
import { merge, Observable, Subject } from 'rxjs';
import { take, takeUntil, tap, skip } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { CosEnvService } from '@pe/base';
import { BusinessInterface, BusinessState, LoadBusinesses } from '@pe/business';
import { AppThemeEnum } from '@pe/common';
import { LocaleService } from '@pe/i18n-core';
import { MediaUrlPipe } from '@pe/media';
import { PeMessageOverlayService, PeMessageService, MessageState } from '@pe/message';
import { DropdownComponent, NotificationsResponseInterface } from '@pe/notifications';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { SearchOverlayService, SearchOverlayComponent } from '@pe/search-dashboard'
import { RegistrationService } from '@pe/shared/registration';

import { NotificationService } from '../../../notifications/src/lib/notification.service';

import { AddBusinessOverlayComponent } from './add-business-overlay/add-business-overlay.component';

@Component({
  selector: 'pe-header',
  templateUrl: 'header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy, OnChanges {
  @Input() menuItems = [
    {
      translateTitle: 'header.menu.switch_business',
      icon: '#icon-switch-block-16',
      onClick: () => {},
    },
    {
      translateTitle: 'header.menu.personal_information',
      icon: '#icon-person-20',
      onClick: () => {},
    },
  ];

  @Select(BusinessState.businesses) businesses$: Observable<{ businesses: BusinessInterface[]; total: number }>;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  @SelectSnapshot(MessageState.messageOverlayStatus) messageOverlayStatus: boolean;

  notifications$: Observable<NotificationsResponseInterface> = this.notificationService.notofications;
  destroyed$ = new Subject<boolean>();
  loading$ = this.peMessageOverlayService.loading$;

  totalBusinesses: number;
  unreadMessages: string;
  showIconOfMessageApp = false;

  contactHref: string;
  helpHref: string;

  theme: AppThemeEnum;

  @ViewChild(DropdownComponent) dropdown: DropdownComponent;

  constructor(
    public envService: CosEnvService,
    private apiService: ApiService,
    private authService: PeAuthService,
    private peOverayWidgetService: PeOverlayWidgetService,
    private notificationService: NotificationService,
    private search: SearchOverlayService,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private mediaUrlPipe: MediaUrlPipe,
    private peMessageOverlayService: PeMessageOverlayService,
    private peMessageService: PeMessageService,
    private localeService: LocaleService,
    private registrationService: RegistrationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.theme = this.businessData?.themeSettings?.theme
      ? AppThemeEnum[this.businessData.themeSettings.theme]
      : AppThemeEnum.default;
    this.store.dispatch(new LoadBusinesses());
  }

  ngOnInit() {
    this.peMessageService.app = 'commerceos';

    if (!this.registrationService.justRegistered && !this.route.snapshot.queryParams?.fromTODO) {
      this.peMessageOverlayService.closeMessages();
    }

    const mainStreamArr$ = [
      this.businesses$.pipe(
        tap((data) => {
          this.totalBusinesses = data.total;
        }),
      ),

      this.store
        .select(state => state.peUserState.peBusinessState)
        .pipe(
          tap(() => {
            this.cdr.detectChanges();
          }),
        ),
    ];

    if (this.peMessageOverlayService.isEnableAppMessage() && !this.envService.isPersonalMode) {
      mainStreamArr$.push(
        this.peMessageOverlayService.unreadMessages().pipe(
          tap((value: number) => {
            this.showIconOfMessageApp = true;
            this.unreadMessages = value > 99 ? '99+' : value === 0 ? '' : value.toString();
            this.cdr.detectChanges();
          }),
        ),
      );

      mainStreamArr$.push(
        this.peMessageOverlayService.hideChatStream().pipe(
          skip(1),
          tap(() => {
            this.peMessageOverlayService.toggleMessages();
          }),
        ),
      );
    }

    merge(...mainStreamArr$)
      .pipe(takeUntil(this.destroyed$))
      .subscribe();

    this.localeService.currentLocale$
      .pipe(
        tap((locale) => {
          this.helpHref = this.contactHref =
            locale.code === 'de' ? 'https://support.payever.org/hc/de' : 'https://support.payever.org/hc/en-us';
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['menuItems']) {
      this.menuItems = changes['menuItems'].currentValue;
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  getBusinessImagePath(image: string): string {
    return image ? (image?.split('/').length > 1 ? image : this.mediaUrlPipe.transform(image, 'images')) : null;
  }

  logout() {
    this.apiService.logout().subscribe();
    this.authService.logout().subscribe();
    this.peMessageOverlayService.closeMessages();
  }

  openSearch() {
    this.search.open(SearchOverlayComponent);
  }

  toggleNotifications() {
    if (!this.dropdown.open) {
      this.dropdown.show();
    } else {
      this.dropdown.hide();
    }
  }

  navigateToExternal(link: string) {
    window.open(link);
  }

  toggleMessages() {
    this.peMessageOverlayService.toggleMessages();
  }

  addBusiness() {
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: AddBusinessOverlayComponent,
      data: {
        theme: this.theme,
        businessRegistrationData: null,
      },
      backdropClass: 'settings-backdrop',
      panelClass: 'settings-widget-panel',
      headerConfig: {
        title: 'Add new business',
        backBtnTitle: 'Cancel',
        theme: this.theme,
        backBtnCallback: () => {
          this.peOverayWidgetService.close();
        },
        cancelBtnTitle: '',
        cancelBtnCallback: () => {},
        doneBtnTitle: 'Done',
        doneBtnCallback: () => {},
      },
    };

    this.apiService
      .getBusinessRegistrationData()
      .pipe(
        take(1),
        tap((data) => {
          config.data.businessRegistrationData = data;
          this.peOverayWidgetService.open(config);
        }),
      )
      .subscribe();
  }

  navigateToSettings() {
    this.router.navigateByUrl(`business/${this.businessData._id}/settings/info`);
  }
}
