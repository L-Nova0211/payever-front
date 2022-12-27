import { Component, Injector, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { EMPTY } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';
import { MessageInterface } from '@pe/dashboard-widgets';
import { EditWidgetsService, MessageNameEnum } from '@pe/shared/widget';
import { Widget } from '@pe/widgets';
import { PeMessageConversationService } from '@pe/message'; 

import { AbstractWidgetComponent } from '../../abstract-widget.component';

@Component({
  selector: 'message-widget',
  templateUrl: './message-widget.component.html',
  styleUrls: ['./message-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageWidgetComponent extends AbstractWidgetComponent implements OnInit {
  readonly appName: string = 'message';
  @Input() widget: Widget;

  private env: EnvInterface = this.injector.get(PE_ENV);

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,
    private editWidgetsService:EditWidgetsService,
    private peMessageConversationService: PeMessageConversationService,

  ) {
    super(injector);
    const DEFAULT_MESSAGE_DATA = this.envService.isPersonalMode
      ? MessageNameEnum.PERSONAL_DEFAULT_MESSAGE_DATA
      : MessageNameEnum.BUSINESS_DEFAULT_MESSAGE_DATA;
    this.editWidgetsService.emitEventWithInterceptor(DEFAULT_MESSAGE_DATA);
  }

  ngOnInit(): void {

    this.editWidgetsService.defaultMessageSubject$.pipe(
      takeUntil(this.destroyed$),
      tap((data : MessageInterface[]) => {
        this.widget = {
          ...this.widget,
          data: data?.map((element) => {
            element.imgSrc = this.isImgSrcValid(element.imgSrc) ? this.buildImgSrc(element.imgSrc) : null;

            return element;
          }),
          openButtonFn: (id) => {
            this.peMessageConversationService.setConversationIdToLs(id);
            this.onOpenButtonClick();

            return EMPTY;
          },
        };
        this.cdr.detectChanges();
      }),

    ).subscribe();
  }

  isImgSrcValid(imgSrc: string): boolean {
    return imgSrc !== null && imgSrc !== '';
  }

  buildImgSrc(imgSrc: string): string {
    return imgSrc.includes(this.env.custom.storage) ? imgSrc : `${this.env.custom.storage}/message/${imgSrc}`;
  }
}
