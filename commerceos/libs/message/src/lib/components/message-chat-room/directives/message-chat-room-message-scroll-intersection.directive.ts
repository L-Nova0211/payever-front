import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

import { PeChatMessageComponent } from '@pe/chat';

import { PeMessageChatRoomListService, PeMessageManagementService } from '../../../services';

import { PeChatRoomListIntersectionDirective } from './message-chat-room-list-intersection.directive';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[peChatRoomMessageScrollIntersection]',
})
export class PeChatRoomMessageScrollIntersectionDirective implements OnInit, OnDestroy {

  public isIntersecting: boolean;

  private elementRef: ElementRef;
  private parent: PeChatRoomListIntersectionDirective;

  constructor(
    private host: PeChatMessageComponent,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageManagementService: PeMessageManagementService,
    parent: PeChatRoomListIntersectionDirective,
    elementRef: ElementRef
    ) {

    this.parent = parent;
    this.elementRef = elementRef;

    this.isIntersecting = false;
  }

  ngOnInit() : void {
    this.parent.add(
      this.elementRef.nativeElement,
      (isIntersecting: boolean) => {
        if (isIntersecting) {
          const { messageObj } = this.host;
          !this.peMessageManagementService.isMessageRead(messageObj)
            && this.peMessageManagementService.updateMessageStatus(messageObj);
        }
      }
    );
  }

  ngOnDestroy() : void {
    this.parent.remove( this.elementRef.nativeElement );
  }
}