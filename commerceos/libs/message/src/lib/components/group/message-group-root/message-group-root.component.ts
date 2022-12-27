import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';

import { GroupFacadeClass } from '../../../classes';
import { PeMessageChatType } from '../../../enums';
import {
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageGuardService,
  PeMessageService,
  PeMessageWebSocketService,
} from '../../../services';
import { PeCreatingChatFormComponent } from '../../chat/creating-chat-form/creating-chat-form.component';

@Component({
  selector: 'pe-message-channel-root',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService, 
    {
      provide: GroupFacadeClass,
      useFactory: (
        peMessageService: PeMessageService,
        peMessageApiService: PeMessageApiService,
        peMessageGuardService: PeMessageGuardService,
      ) => {
        return new GroupFacadeClass(
          peMessageService.app,
          peMessageApiService,
          peMessageGuardService
        );
      },
      deps: [PeMessageService, PeMessageApiService, PeMessageGuardService],
    }],
})
export class PeMessageGroupRootComponent implements OnInit {
  theme = 'dark';

  constructor(
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private chatClass: GroupFacadeClass,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageWebSocketService: PeMessageWebSocketService,
    private destroyed$: PeDestroyService,
  ) { }

  ngOnInit(): void {
    this.openChannelFormOverlay();
  }

  private openChannelFormOverlay(): void {
    const onCloseSubject$ = new Subject<boolean>();
    const isLoading$ = new BehaviorSubject<boolean>(false);
    const peOverlayConfig: PeOverlayConfig = {
      backdropClick: () => {
        this.router.navigate(['../'], { relativeTo: this.route });
        this.peOverlayWidgetService.close();
      },
      data: {
        onCloseSubject$,
        isLoading$,
        type: PeMessageChatType.Group,
        theme: this.theme,
        chatClass: this.chatClass,
      },
      hasBackdrop: true,
      headerConfig: {
        hideHeader: true,
        removeContentPadding: true,
        title: this.translateService.translate('message-app.channel.overlay.title'),
        theme: this.theme,
      },
      panelClass: 'pe-message-channel-form-overlay',
      component: PeCreatingChatFormComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onCloseSubject$.pipe(
      take(1),
      tap((res: null | boolean) => {
        this.router.navigate(['../'], { relativeTo: this.route });
        this.peOverlayWidgetService.close();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
