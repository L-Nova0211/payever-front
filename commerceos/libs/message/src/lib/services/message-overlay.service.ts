import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { Observable, BehaviorSubject } from 'rxjs';

import { BusinessInterface, BusinessState } from '@pe/business';
import { DockerItemInterface, DockerState } from '@pe/docker';

import { PeMessageOverlayComponent } from '../components/overlay/message-overlay.component';
import { PeMessageChatRoomListService } from '../services/message-chat-room-list.service';
import { PeMessageService } from '../services/message.service';
import { SetMessageOverlayStatus } from '../state/message.actions';

@Injectable({ providedIn: 'root' })
export class PeMessageOverlayService {
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  @SelectSnapshot(DockerState.dockerItems) dockerItems:DockerItemInterface[];

  private overlayRef: OverlayRef;
  private messageStatus: string;
  public loadingOverlay$ = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingOverlay$.asObservable();

  constructor(
    private overlay: Overlay,
    private store: Store,
    private peMessageService: PeMessageService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
  ) {}

  isEnableAppMessage(): boolean {
    return !!this.dockerItems?.find((item: DockerItemInterface) => item.code === 'message' && item.installed);
  }

  toggleMessages(firstStart = false) {
    if (!this.isEnableAppMessage()) {
      return;
    }

    if (this.messageStatus === null) {
      this.loadingOverlay$.next(true);
      this.overlayRef = this.overlay.create({
        positionStrategy: this.overlay
          .position()
          .global()
          .right('16px')
          .top('68px'),
        hasBackdrop: false,
        backdropClass: 'pe-message-settings-menu-backdrop',
        panelClass: 'pe-message-panel-class',
      });

      this.overlayRef.attach(new ComponentPortal(PeMessageOverlayComponent));
      this.store.dispatch(new SetMessageOverlayStatus('open'));
      this.messageStatus = 'open';
    } else if (this.messageStatus !== null && !firstStart) {
      this.closeMessages();
    }
  }

  closeMessages(): void {
    this.overlayRef?.detach();
    this.messageStatus = null;
    this.loadingOverlay$.next(false);
    this.store.dispatch(new SetMessageOverlayStatus(null));
  }

  hideChatStream(): Observable<any> {
    return this.peMessageService.liveChatBubbleClickedStream$;
  }

  unreadMessages(): Observable<number> {
    return this.peMessageChatRoomListService.externalUnreadMessages();
  }

  setAppName(app: string): void {
    this.peMessageService.app = app;
  }
}
