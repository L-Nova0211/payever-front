import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Inject, OnInit,
} from '@angular/core';
import { Observable } from 'rxjs/index';
import { takeUntil, tap, filter, map, delay } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV, PeDestroyService } from '@pe/common';

import { PeMessageBubbleBrand, PeMessageBubbleLayouts, PeMessageBubbleStyle } from '../../../enums';
import { PeMessageBubble } from '../../../interfaces';
import { PeMessageService } from '../../../services/message.service';

@Component({
  selector: 'pe-message-bubble-live-chat',
  templateUrl: './message-bubble-live-chat.component.html',
  styleUrls: ['./message-bubble-live-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeMessageBubbleLiveChatComponent implements OnInit {

  opened = false;
  //need for safari viewing during settings changes
  hidden = false;
  cornerStyle = PeMessageBubbleStyle.Rounded;

  payeverMessageLogo = `${this.environmentConfigInterface.custom.cdn}/icons/payever-message.svg`;
  payeverMessageLogoSmall = `${this.environmentConfigInterface.custom.cdn}/icons/payever-message-small-brand.svg`;

  item!: PeMessageBubble;
  logo!: string;
  companyName!: string;
  boxShadow!: string;
  get unreadMessages$(): Observable<any> {
    return this.peMessageService.unreadMessages$.pipe(
      map((value: number) => {
        return value > 99 ? '99+' : value.toString();
      }),
    );
  }

  @HostBinding('class.opened') op = this.opened;

  constructor(
    private destroyed$: PeDestroyService,
    private peMessageService: PeMessageService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(PE_ENV) private environmentConfigInterface: EnvironmentConfigInterface,
  ) { }

  ngOnInit(): void {
    this.peMessageService.liveChatBubbleClickedStream$.pipe(
      tap((val: boolean) => {
        this.opened = val;
        this.op = this.opened;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.peMessageService.bubble$.pipe(
      filter((bubble: PeMessageBubble) => Object.keys(bubble).length > 0),
      tap((bubble: PeMessageBubble) => {
        this.item = bubble;
        this.item.layout = bubble.layout || PeMessageBubbleLayouts.Logo;
        this.item.roundedValue = bubble.style === PeMessageBubbleStyle.Rounded && bubble.roundedValue
          ? bubble.roundedValue : '';

        this.boxShadow = bubble.boxShadow ? `0 0 10px ${bubble.boxShadow}` : '';

        if (!bubble.brand || bubble.brand === PeMessageBubbleBrand.Payever) {
          this.logo = bubble.style === PeMessageBubbleStyle.Circle
            ? this.payeverMessageLogoSmall : this.payeverMessageLogo;
          bubble.layout = PeMessageBubbleLayouts.Logo;
        } else {
          this.logo = bubble.businessDocument?.logo ?
            `${this.environmentConfigInterface.custom.storage}/images/${bubble.businessDocument.logo}` :
            '';
          this.companyName = bubble.businessDocument?.name?.split(' ').map((n: string) => {
            return n.charAt(0);
          }).splice(0, 2).join('').toUpperCase() ?? 'CHAT';
        }

        this.hidden = true;
        this.changeDetectorRef.markForCheck();
      }),
      delay(100),
      tap(() => {
        this.hidden = false;
        this.changeDetectorRef.markForCheck();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  onClick(): void {
    this.opened = !this.opened;
    this.op = this.opened;
    this.peMessageService.liveChatBubbleClickedStream$.next(this.opened);
  }

}
