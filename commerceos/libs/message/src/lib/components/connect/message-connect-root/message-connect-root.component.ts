import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { takeUntil, tap, switchMap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeChatChannelMenuItem } from '@pe/shared/chat';

import { PeMessageSubscription, PeMessageSubscriptionAll } from '../../../interfaces';
import { PeMessageChatRoomService } from '../../../services';
import { PeMessageApiService } from '../../../services/message-api.service';
import { MessageStateService } from '../../../services/message-state.service';
import { PeMessageService } from '../../../services/message.service';
import { PeMessageSubscriptionListComponent } from '../message-subscription-list';

@Component({
  selector: 'pe-message-connect-root',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeMessageConnectRootComponent implements OnInit {

  theme = 'dark';

  constructor(
    private peMessageService: PeMessageService,
    private peMessageApiService: PeMessageApiService,
    private translateService: TranslateService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private peMessageChatRoomService: PeMessageChatRoomService,
    private router: Router,
    private route: ActivatedRoute,
    private destroyed$: PeDestroyService,
    private messageStateService: MessageStateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.peMessageApiService.getSubscriptionList().pipe(
      tap((subscriptionList: any) => {
        this.peMessageService.subscriptionList = subscriptionList.filter(sub => sub.installed);
        this.openSubscriptionListOverlay();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  private openSubscriptionListOverlay(): void {
    const peOverlayConfig: PeOverlayConfig = {
      data: {
        subscriptionList: this.peMessageService.subscriptionList,
        close: () => {
          this.peOverlayWidgetService.close();
        },
      },
      hasBackdrop: true,
      backdropClick: () => {
        this.router.navigate(['../'], { relativeTo: this.route });
        this.peOverlayWidgetService.close();
      },
      headerConfig: {
        title: this.translateService.translate('message-app.sidebar.connect'),
        theme: this.theme,
        backBtnTitle: this.translateService.translate('message-app.sidebar.cancel'),
        backBtnCallback: () => {
          this.router.navigate(['../'], { relativeTo: this.route });
          this.peOverlayWidgetService.close();
        },
        doneBtnTitle: this.translateService.translate('message-app.sidebar.done'),
        doneBtnCallback: () => {
          if (peOverlayConfig.headerConfig.isLoading) { return; }
          if (!peOverlayConfig.data.changes) { this.peOverlayWidgetService.close(); }

          peOverlayConfig.headerConfig.doneBtnTitle = this.translateService.translate('loading');
          peOverlayConfig.headerConfig.isLoading = true;
          this.cdr.detectChanges();

          const changes = peOverlayConfig.data.changes;
          peOverlayConfig.data.subscriptionList.filter((subscription: PeMessageSubscription) => {
            return changes && subscription.enabled !== changes[subscription.integration.name];
          }).forEach((subscription: PeMessageSubscription, indx, arr) => {
            const name = subscription.integration.name;
            this.toggleSubscription(name, changes[name]).pipe(
              tap(() => {
                if (indx === arr.length - 1) {
                  this.router.navigate(['../'], { relativeTo: this.route });
                  this.peOverlayWidgetService.close();
                }
              }),
              takeUntil(this.destroyed$),
            ).subscribe();
          });
        },
      },
      panelClass: 'pe-message-overlay-subscription-list',
      component: PeMessageSubscriptionListComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);
  }

  private toggleSubscription(integrationName: string, enabled: boolean): Observable<any> {
    const request = enabled ? this.peMessageApiService.patchSubscriptionInstall(integrationName)
      : this.peMessageApiService.patchSubscriptionUninstall(integrationName);

    return request.pipe(
      switchMap(() => {
        const subscriptionList = cloneDeep(this.peMessageService.subscriptionList);
        const foundSubscription = subscriptionList.find(s => s.integration.name === integrationName);
        if (foundSubscription) {
          foundSubscription.enabled = enabled;
        }

        this.peMessageChatRoomService.channelMenuItems$.next(
          subscriptionList.map(subscription => subscription.integration.name) as PeChatChannelMenuItem[]
        );

        this.peMessageService.subscriptionList = subscriptionList;

        if (foundSubscription && enabled && integrationName === PeChatChannelMenuItem.LiveChat) {
          return this.peMessageApiService.getSubscriptionsAll().pipe(
            tap((subscriptions: PeMessageSubscriptionAll[]) => {
              subscriptions.forEach((subscription: PeMessageSubscriptionAll) => {
                const foundSubscriptionInner = subscriptionList
                  .find(s => s.integration.name === subscription.integration.name);

                if (foundSubscriptionInner) {
                  foundSubscriptionInner.info = {
                    ...subscription.info,
                    authorizationId: subscription.authorizationId,
                  };
                }
              });

              this.messageStateService.conversationList = subscriptionList;
            }),
          );
        }

        return of(true);
      }),
    );
  }
}
