import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, Injector, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import {
  CheckoutChannelSetInterface,
  CheckoutInterface,
  CheckoutSettingsInterface,
  ChecktouSettingsToggleInterface,
  LanguageInterface,
  SettingsMenuItemInterface,
  SettingsModalType,
  SettingsPanelType,
} from '../../../interfaces';
import { settingsMenu } from '../../../panels-info-data';
import { CallbacksComponent } from '../../settings/callbacks/callbacks.component';
import { ColorAndStyleComponent } from '../../settings/color-and-style/color-and-style.component';
import { CspComponent } from '../../settings/csp/csp.component';
import { EditSettingsComponent } from '../../settings/edit/edit-settings.component';
import { LanguageComponent } from '../../settings/language/language.component';
import { NotificationsComponent } from '../../settings/notifications/notifications.component';
import { PoliciesComponent } from '../../settings/policies/policies.component';
import { AbstractPanelComponent } from '../abstract-panel.component';

@Component({
  selector: 'panel-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PanelSettingsComponent extends AbstractPanelComponent {
  currentCheckoutConfig: CheckoutInterface;
  channelSetId: string;

  enableToggle: ChecktouSettingsToggleInterface = {
    colorAndStyle: false,
    testingMode: false,
  };

  theme = 'dark';
  openedModalType: SettingsModalType;
  SettingsModalType = SettingsModalType;
  isModal: boolean = this.activatedRoute.snapshot.data['modal'] || this.activatedRoute.parent.snapshot.data['modal'];

  copied$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  checkoutSettings$: Observable<CheckoutInterface> = this.storageService.getCheckoutByIdOnce(this.checkoutUuid)
    .pipe(takeUntil(this.destroyed$));

  settingsMenu$: Observable<SettingsMenuItemInterface[]> = this.isSmsProviderConnected().pipe(
    takeUntil(this.destroyed$),
    map((isSmsProviderConnected) => {
      return isSmsProviderConnected ? settingsMenu :
        settingsMenu.filter((item: SettingsMenuItemInterface) => [
          SettingsPanelType.PhoneNumber,
          SettingsPanelType.Message,
        ].indexOf(item.name) < 0);
    }));

  languages$: Observable<string> = this.storageService.getCheckoutById(this.checkoutUuid).pipe(
    takeUntil(this.destroyed$),
    filter(d => !!d && !!d.settings),
    map((checkout: CheckoutInterface) => {
      return checkout.settings.languages.filter(lang => lang.active).map((lang: LanguageInterface) =>
        lang.active && lang.isDefault
          ? this.translateService.translate('info_boxes.main.langDefault', { lang: lang.name })
          : lang.name
      ).join(', ');
    })
  );

  settingsLoadingAction$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  // This delay is used to show spinner instead of Edit link in Settings
  private readonly settingsNavigateDelay: number = 0;
  private clipboardService: ClipboardService = this.injector.get(ClipboardService);
  private changeDetectorRef: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);

  dialogRef: PeOverlayRef;
  onSaveSubject$ = new BehaviorSubject<number>(0);
  onCloseSubject$ = new BehaviorSubject<number>(0);

  constructor(
    injector: Injector,
    private route: ActivatedRoute,
    private location: Location,
    private overlayService: PeOverlayWidgetService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.storageService.getChannelSetsForCheckoutByTypeOnce(
      this.checkoutUuid, 'link'
    ).subscribe((channelSetIds: CheckoutChannelSetInterface[]) => {
      if (channelSetIds && channelSetIds.length > 0) {
        this.channelSetId = channelSetIds[0].id;
        this.changeDetectorRef.detectChanges();
      } else {
        console.error('Channel set id not found');
      }
    });

    this.checkoutSettings$.subscribe((checkoutConfig: CheckoutInterface) => {
      this.currentCheckoutConfig = checkoutConfig;

      this.enableToggle.testingMode = !!checkoutConfig.settings.testingMode;
      this.enableToggle.colorAndStyle = !!(checkoutConfig.settings.styles && checkoutConfig.settings.styles.active);
    });

    this.storageService.getBusiness()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((business) => {
        this.theme = business?.themeSettings?.theme && business?.themeSettings?.theme !== 'default'
        ? business.themeSettings.theme : 'dark';
        this.route.params.subscribe((params) => {
          this.openedModalType = params?.modal || null;
          if (this.openedModalType) {
            this.initModal();
          }
        });
      });
  }

  isSmsProviderConnected(): Observable<boolean> {
    return this.$enabledIntegrations.pipe(map((names) => {
      return names.indexOf('twilio') >= 0; // TODO For now only Twilio but in future can be more
    }));
  }

  onToggle(element: SettingsMenuItemInterface) {
    const newSettings: CheckoutSettingsInterface = this.currentCheckoutConfig.settings;

    this.enableToggle[element.name] = !this.enableToggle[element.name];

    if (!newSettings.styles) {
      newSettings.styles = {};
    }
    newSettings.styles.active = this.enableToggle.colorAndStyle;
    newSettings.testingMode = this.enableToggle.testingMode;

    this.storageService.saveCheckoutSettings(this.checkoutUuid, newSettings).subscribe(() => {
      this.onUpdateData();
    }, (err) => {
      this.storageService.showError(err);
      this.enableToggle[element.name] = !this.enableToggle[element.name];
    });
  }

  onSettingsClickButton(item: SettingsMenuItemInterface) {
    const action: string = item.url;
    if (action === 'channelSetId') {
      if (this.channelSetId) {
        item.nameButton = 'channels.directLink.copied';
        this.clipboardService.copyFromContent(this.channelSetId);
        timer(1500).pipe(takeUntil(this.destroyed$)).subscribe(() => {
          item.nameButton = 'actions.copy';
        });
      }
    } else if (action) {
      this.settingsLoadingAction$.next(action);
      let obs$: Observable<any> = of(null).pipe();
      if (action === 'phone') {
        obs$ = this.storageService.fetchPhoneNumbers();
      }
      obs$.subscribe(() => {
        this.openedModalType = action as SettingsModalType;
        this.initModal();
      });
    } else {
      console.error('Empty action to navigate!');
    }
  }

  onCopyClick(test: string): void {
    if (!this.copied$.value) {
      this.clipboardService.copyFromContent(test);
      this.copied$.next(true);
      setTimeout(() => this.copied$.next(false), 2000);
    }
  }

  private initModal() {
    this.onSaveSubject$ = new BehaviorSubject<number>(0);
    this.onCloseSubject$ = new BehaviorSubject<number>(0);
    const config: PeOverlayConfig = {
      data: {
        theme: this.theme,
        isModal: this.isModal,
        checkoutUuid: this.checkoutUuid,
        onSave$: this.onSaveSubject$.asObservable(),
        editType: this.openedModalType,
        onClose$: this.onCloseSubject$.asObservable(),
        close: () => {
          this.dialogRef?.close();
        },
      },
      hasBackdrop: true,
      backdropClass: 'settings-modal',
      headerConfig: {
        title: '',
        backBtnTitle: this.translateService.translate('actions.cancel'),
        backBtnCallback: () => {
          this.onCloseSubject$.next(1);
        },
        doneBtnTitle: this.translateService.translate('create_checkout.done'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(1);
        },
        theme: this.theme,
        loadingText$: of(this.translateService.translate('actions.loading')),
      },
      component: null,
    };
    switch (this.openedModalType) {
      case SettingsModalType.ColorAndStyle:
        config.headerConfig.title = this.translateService.translate('settings.colorAndStyle.listTitle');
        config.component = ColorAndStyleComponent;
        break;
      case SettingsModalType.Languages:
        config.headerConfig.title = this.translateService.translate('settings.languages.listTitle');
        config.component = LanguageComponent;
        break;
      case SettingsModalType.Policies:
        config.headerConfig.title = this.translateService.translate('settings.policies.listTitle');
        config.component = PoliciesComponent;
        break;
      case SettingsModalType.Csp:
        config.headerConfig.title = this.translateService.translate('settings.csp.title');
        config.component = CspComponent;
        break;
      case SettingsModalType.Phone:
        config.headerConfig.title = this.translateService.translate('info_boxes.edit.phoneNumber.label');
        config.component = EditSettingsComponent;
        break;
      case SettingsModalType.Message:
        config.headerConfig.title = this.translateService.translate('info_boxes.edit.message.label');
        config.component = EditSettingsComponent;
        break;
      case SettingsModalType.Notifications:
        config.headerConfig.title = this.translateService.translate('settings.notifications.listTitle');
        config.component = NotificationsComponent;
        break;
      case SettingsModalType.Callbacks:
        config.headerConfig.title = this.translateService.translate('settings.callbacks.title');
        config.component = CallbacksComponent;
        break;
    }

    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed.subscribe(() => {
      if (this.activatedRoute.snapshot.data['modal'] || this.activatedRoute.parent.snapshot.data['modal']) {
        this.location.back();
        this.initCurrentCheckout(this.checkoutUuid);
      }
    });
  }
}
