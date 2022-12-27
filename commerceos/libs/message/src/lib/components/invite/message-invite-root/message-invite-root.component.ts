import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';

import { GroupFacadeClass } from '../../../classes';
import {
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageGuardService,
  PeMessageService,
} from '../../../services';
import { PeMessageInviteFormComponent } from '../message-invite-form';

@Component({
  selector: 'pe-invite-root',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
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
          peMessageGuardService,
        );
      },
      deps: [PeMessageService, PeMessageApiService, PeMessageGuardService],
    },
  ],
})
export class PeMessageInviteRootComponent implements OnInit {
  theme = 'dark';

  constructor(
    public groupClass: GroupFacadeClass,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private peMessageApiService: PeMessageApiService,
    private destroyed$: PeDestroyService,
  ) { }

  ngOnInit(): void {
    this.openGroupFormOverlay();
  }

  getInvitations(id: string): Observable<any> {
    return this.peMessageApiService.getChatInvites(id);
  }

  private openGroupFormOverlay(): void {
    const onCloseSubject$ = new Subject<boolean>();
    const onSaveSubject$ = new Subject<boolean>();
    const isLoading$ = new BehaviorSubject<boolean>(false);

    const peOverlayConfig: PeOverlayConfig = {
      data: {
        onCloseSubject$,
        onSaveSubject$,
        isLoading$,
        theme: this.theme,
      },
      hasBackdrop: true,
      headerConfig: {
        hideHeader: true,
        removeContentPadding: true,
        title: this.translateService.translate('message-app.group.add_contact'),
        theme: this.theme,
      },
      backdropClick: () => {
        this.router.navigate(['../'], { relativeTo: this.route });
        this.peOverlayWidgetService.close();
      },
      component: PeMessageInviteFormComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onCloseSubject$.pipe(
      take(1),
      tap(() => {
        this.router.navigate(['../'], { relativeTo: this.route });
        this.peOverlayWidgetService.close();
      }),
    ).subscribe();
  }
}
