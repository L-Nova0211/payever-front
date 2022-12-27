import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';

import { ChannelFacadeClass } from '../../../classes';
import { PeMessageChatType } from '../../../enums';
import { PeMessageApiService, PeMessageGuardService, PeMessageService } from '../../../services';
import { PeCreatingChatFormComponent } from '../../chat/creating-chat-form/creating-chat-form.component';

@Component({
  selector: 'pe-message-channel-root',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
    {
      deps: [PeMessageService, PeMessageApiService, PeMessageGuardService],
      provide: ChannelFacadeClass,
      useFactory: (
        peMessageService: PeMessageService,
        peMessageApiService: PeMessageApiService,
        peMessageGuardService: PeMessageGuardService,
      ) => {
        return new ChannelFacadeClass(
          peMessageService.app,
          peMessageApiService,
          peMessageGuardService
        );
      },
    },
  ],
})
export class PeMessageChannelRootComponent implements OnInit {
  theme = 'dark';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,

    private chatClass: ChannelFacadeClass,
  ) { }

  ngOnInit(): void {
    this.openChannelFormOverlay();
  }

  private openChannelFormOverlay(): void {
    const closeForm = () => {
      this.router.navigate(['../'], { relativeTo: this.activatedRoute });
      this.peOverlayWidgetService.close();
    };

    const onCloseSubject$ = new Subject<boolean>();
    const isLoading$ = new BehaviorSubject<boolean>(false);

    const peOverlayConfig: PeOverlayConfig = {
      component: PeCreatingChatFormComponent,
      backdropClick: closeForm,
      data: {
        onCloseSubject$,
        isLoading$,
        type: PeMessageChatType.Channel,
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
      panelClass: 'pe-message-chat-form-overlay',
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onCloseSubject$
      .pipe(
        take(1),
        tap(closeForm))
      .subscribe();
  }
}
