
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { SetRecipientEmails } from '@pe/message';
import { OverlayHeaderConfig, PeOverlayConfig, 
    PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA, PeOverlayRef } from '@pe/overlay-widget';
import { Widget, WidgetData, WidgetType } from '@pe/widgets';

import { ContactMainInfo, ContactResponse, StatusField } from '../../interfaces';
import { ContactsGQLService } from '../../services';
import { getContactDisplayFields } from '../../utils/contacts';
import { GroupModalComponent } from '../group-modal';



const DEFAULT_WIDGET: Widget = {
  _id: '',
  type: WidgetType.Icons,
  appName: '',
  title: '',
  data: [],
  installedApp: true,
  setupStatus: 'completed',
  showInstallAppButton: false,
  defaultApp: true,
  installed: true,
  onInstallAppClick: (): any => {
  },
};

@Component({
  selector: 'pe-contacts-widget',
  templateUrl: './contacts-widget.component.html',
  styleUrls: ['./contacts-widget.component.scss'],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsWidgetComponent implements OnInit {

  @ViewChild('statusTrigger') statusTrigger: MatMenuTrigger;
  contactStatus = 'No status';
  contactData: ContactResponse = null;
  contactInfo: ContactMainInfo = null;

  socialIconsWidget: Widget;
  transactionsWidget: Widget;
  shopWidget: Widget;
  productsWidget: Widget;
  contactsWidget: Widget;
  adsWidget: Widget;
  statuses: StatusField[] = [];
  isLoading = false;

  socialIconsWidgetData: WidgetData[];
  public theme: AppThemeEnum;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private store: Store,

    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
    private overlayRef:PeOverlayRef,
    private contactsGQLService: ContactsGQLService,
    private envService: EnvService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
    private peOverlayWidgetService: PeOverlayWidgetService,
  ) {
    this.theme = this.peOverlayConfig.theme as AppThemeEnum;
    this.peOverlayConfig.doneBtnTitle = this.translateService.translate('contacts-app.actions.done');
  }

  ngOnInit(): void {
    this.isLoading = true;
    let contactId = this.peOverlayData?.item?.id?.split('|')[0];
    if (!contactId) {
      contactId = this.peOverlayData?.item?.id;
    }

    this.contactsGQLService.getContactById(contactId)
      .pipe(
        tap((contact: ContactResponse) => {
          this.isLoading = false;
          this.setUpWidgets(contact);
        }),
        takeUntil(this.destroy$))
      .subscribe();
    this.store.dispatch(new SetRecipientEmails([]));
  }

  openStatusMenu(): void {
    if (this.statuses?.length) {
      this.statusTrigger.openMenu();
    }
  }

  selectStatus(status: StatusField): void {
    this.contactStatus = status.name;
  }

  private setUpWidgets(contactRes: ContactResponse): void {
    const contact: ContactMainInfo = getContactDisplayFields(contactRes);
    this.contactInfo = contact;
    this.socialIconsWidgetData = [
      {
        title: 'Call',
        icon: '#call-widget-icon',
        loading: false,
        notProcessLoading: true,
        onSelect: (): any => {
          document.location.href = `tel:${contact.mobilePhone}`;
        },
      },
      {
        title: 'Mail',
        icon: '#mail-widget-icon',
        loading: false,
        notProcessLoading: true,
        onSelect: (): any => {
          this.store.dispatch(new SetRecipientEmails([contact.email]))
          document.location.href = `mailto:${contact.email}`;
        },
      },
    ];

    if (contact.mobilePhone === '') {
      this.socialIconsWidgetData = this.socialIconsWidgetData.filter(item => item.title !== 'Call');
    }

    if (contact.email === '') {
      this.socialIconsWidgetData = this.socialIconsWidgetData.filter(item => item.title !== 'Mail');
    }

    this.socialIconsWidget = {
      ...DEFAULT_WIDGET,
      _id: 'socialWidget',
      icon: '#social-widget-icon',
      type: WidgetType.Icons,
      title: 'communication',
      data: this.socialIconsWidgetData,
    };

    this.contactData = contactRes;
    this.cdr.detectChanges();
  }

  public goEditContactPage(): void {
    this.peOverlayConfig.onSaveSubject$.next(this.peOverlayData.item);
  }

  public openGroup(){
      const config:PeOverlayConfig = {
          component:GroupModalComponent,
          data:this.peOverlayData,
      };
      this.peOverlayWidgetService.open(config)
  }
}
