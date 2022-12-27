import { Component, OnInit } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { clone } from 'lodash-es';
import { combineLatest, forkJoin, fromEvent, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { SnackbarService } from '@pe/snackbar';
import { TranslateService } from '@pe/i18n';

import { checkoutPanels, PanelInterface } from '../../interfaces';
import {
  CheckoutChannelSetInterface,
  CheckoutInterface,
  CustomChannelInterface,
  CustomChannelTypeEnum,
  IntegrationCategory,
  IntegrationInfoInterface,
} from '../../interfaces';
import { ApiService, StorageService, RootCheckoutWrapperService } from '../../services';
import { HeaderService } from '../../services/header.service';
import { NavbarColor, NavbarPosition } from '../../shared/navbar';
import { SubdashboardHeaderDropdownItemInterface } from '../../shared/overlay-box';

@Component({
  selector: 'checkout-full',
  templateUrl: './checkout-full-modal.component.html',
  styleUrls: ['./checkout-full-modal.component.scss'],
  providers: [
    PeDestroyService,
  ],
})
export class CheckoutFullModalComponent implements OnInit {
  // TODO Rename as CheckoutAsModalComponent

  panels: PanelInterface[] = checkoutPanels.map(a => clone(a)).filter(a => a.isForModal);

  isSwitchedEnabled = true;
  currentCheckout$: Observable<CheckoutInterface> = this.storageService.getCheckoutById(this.checkoutUuid)
    .pipe(takeUntil(this.destroyed$), filter(d => !!d));

  customChannelList$: Observable<CustomChannelInterface[]>;

  categories = IntegrationCategory;

  isShowCheckout$: Observable<boolean> = this.wrapperService.checkoutVisible$;

  headerDropdownItems$: Observable<SubdashboardHeaderDropdownItemInterface[]> = combineLatest(
    this.storageService.getCheckouts(),
    this.storageService.getCheckoutById(this.checkoutUuid)
  ).pipe(
    takeUntil(this.destroyed$),
      filter(data => !!data[0] && !!data[1]),
      switchMap(([checkoutList, currentCheckout]) => {
        return this.storageService.getChannelSetsForCheckout(currentCheckout._id)
          .pipe(map(channelSets => [checkoutList, channelSets, currentCheckout]));
    }),
    map((data: [CheckoutInterface[], CheckoutChannelSetInterface[], CheckoutInterface]) => {
      const checkoutList: CheckoutInterface[] = data[0];
      const channelSets: CheckoutChannelSetInterface[] = data[1];
      const currentCheckout: CheckoutInterface = data[2];

      let buttons: SubdashboardHeaderDropdownItemInterface[] = [];

      buttons.push({
        label: 'info_boxes.main.addNewCheckout',
        onClick: () => this.router.navigate([`../../create`], { relativeTo: this.activatedRoute }),
      });

      if (!currentCheckout.default) {
        const newButton: SubdashboardHeaderDropdownItemInterface = {
          label: 'info_boxes.main.setCheckoutAsDefault',
          onClick: () => {
            this.storageService.setDefaultCheckout(this.checkoutUuid).subscribe(() => {
              this.snackBarService.toggle(true, { content: this.translateService.translate('setCheckoutAsDefault.done')});
            }, (error) => {
              this.snackBarService.toggle(true, { content: error ? error.message : this.translateService.translate('errors.unknown')});
            });
          },
        };
        buttons.push(newButton);
      }

      buttons.push({
        label: 'actions.edit',
        onClick: () => this.router.navigate([`../edit`], { relativeTo: this.activatedRoute }),
      });

      if (this.isAllowToDeleteCheckout(checkoutList, channelSets)) {
        const deleteButton: SubdashboardHeaderDropdownItemInterface = {
          label: 'actions.delete',
          onClick: () => this.router.navigate([`../delete`], { relativeTo: this.activatedRoute }),
        };
        buttons = [ ...buttons, deleteButton ];
      }

      if (checkoutList && checkoutList.length > 1 && this.isSwitchedEnabled) {
        const newButton: SubdashboardHeaderDropdownItemInterface = {
          label: 'info_boxes.main.switchCheckout',
          onClick: () => this.router.navigate(['../../switch'],
          { relativeTo: this.activatedRoute }), // this.onClickButton('switch') // TODO
        };
        buttons = [...[newButton], ...buttons];
      }

      return buttons;
    })
  );

  isTestingMode$: Observable<boolean> = this.storageService.getCheckoutById(this.checkoutUuid).pipe(
    takeUntil(this.destroyed$),
    filter(d => !!d && !!d.settings),
    map((checkout: CheckoutInterface) => !!checkout.settings.testingMode)
  );

  panelHeight$: Observable<string> = fromEvent(window, 'resize').pipe(
    takeUntil(this.destroyed$),
    map(() => window.innerWidth),
    map((width: number) => width > 600),
    distinctUntilChanged(),
    map((isDesktop: boolean) => isDesktop ? '120px' : '60px')
  );

  navbarColor: NavbarColor = NavbarColor.Dusky;
  navbarPosition: NavbarPosition = NavbarPosition.FixedTop;

  private readonly defaultChannelSets: string[] = ['link', 'finance_express'];

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private headerService: HeaderService,
    private router: Router,
    private snackBarService: SnackbarService,
    private storageService: StorageService,
    private translateService: TranslateService,
    private wrapperService: RootCheckoutWrapperService,
    private destroyed$: PeDestroyService,
  ) {
  }

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid']
    || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  ngOnInit(): void {
    forkJoin(
      this.apiService.getBusiness(this.storageService.businessUuid),
      this.storageService.getCheckoutByIdOnce(this.checkoutUuid)
    )
      .subscribe(([business, currentCheckout]) => {
        this.customChannelList$ = this.storageService.getCategoryInstalledIntegrationsInfo(
          IntegrationCategory.Channels
        ).pipe(
          map((channelList: IntegrationInfoInterface[]): CustomChannelInterface[] => (channelList || [])
            .filter(channel => channel.integration)
            .map((channel: IntegrationInfoInterface) => ({
                title: channel.integration.displayOptions.title,
                key: channel.integration.name,
                icon: channel.integration.displayOptions.icon,
                order: channel.integration.displayOptions.order || 0,
                nameButton: channel.integration.settingsOptions.action || '',
                url: channel.integration.settingsOptions.url || '',
              })
            )
            .sort((a, b) => b.order - a.order)
          ),
          map((channelList: CustomChannelInterface[]) => {
            // NOTE: for Denmark we shoudl rename 'Calculator' to 'Banner'
            if (business && business.companyAddress && business.companyAddress.country === 'DK') {
              return channelList.map((channel: CustomChannelInterface) => {
                return channel.key === CustomChannelTypeEnum.Calculator
                  ? { ...channel, title: 'channelsList.banner' }
                  : channel;
              });
            } else {
              return channelList;
            }
          })
        );
        this.headerService.setShortHeader('info_boxes.checkoutAppName', () => this.onCloseClick());
      });

    this.activateCurrentCategory();
  }

  onCloseClick(): void {

    this.router.navigate(['../../switch'], { relativeTo: this.activatedRoute });

    // this.headerService.historyBack();
    // const app: string = this.route.snapshot.params['app'] || this.route.parent.snapshot.params['app'];
    // const appId: string = this.route.snapshot.params['appId'] || this.route.parent.snapshot.params['appId'];
    // if (app === 'connect') {
    //   this.platformService.dispatchEvent({
    //     target: DashboardEventEnum.MicroNavigation as string,
    //     action: '',
    //     data: `connect/accountings/debitoor`
    //   });
    // } else {
    //   this.platformService.dispatchEvent({
    //     target: DashboardEventEnum.MicroNavigation as string,
    //     action: '',
    //     data: `${app}/${appId}/edit`
    //   });
    // }
  }

  activateCurrentCategory(): void {
    const activeTabKey = this.activatedRoute.snapshot.params['panel'] || this.activatedRoute.snapshot.data['panel'];
    this.panels.map(panel => `panel-${panel.key}` === activeTabKey ? panel.active = true : null);
  }

  navigateToCategory(panel: PanelInterface, matPanel: MatExpansionPanel): void {
    this.router.navigate(['..', matPanel.expanded ?
    `panel-${panel.key}` : 'view'], { relativeTo: this.activatedRoute, replaceUrl: true });
  }

  /**
   * User cannot remove alone checkout with channel sets except default 'link' and 'finance_express'
   * @param checkoutList
   * @param channelSets
   */
  private isAllowToDeleteCheckout(checkoutList: CheckoutInterface[],
    channelSets: CheckoutChannelSetInterface[]): boolean {
    return !(
      checkoutList
      && checkoutList.length === 1
      && channelSets
      && channelSets.findIndex((channelSet: CheckoutChannelSetInterface) =>
      this.defaultChannelSets.indexOf(channelSet.type) < 0) > -1
    );
  }

  // private getHistoryBackInputData(): any {
  //   const headerInputData: any = {
  //     business: this.storageService.businessUuid
  //   };
  //   const app: string = this.activatedRoute.snapshot.params['app'];
  //   headerInputData[app] = this.activatedRoute.snapshot.params['appId'];
  //   return headerInputData;
  // }
}
