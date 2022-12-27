import { Component, Injector, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { EMPTY } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { SocialInterface } from '@pe/dashboard-widgets';
import { EditWidgetsService, MessageNameEnum } from '@pe/shared/widget';
import { Widget } from '@pe/widgets';

import { AbstractWidgetComponent } from '../../abstract-widget.component';

@Component({
  selector: 'social-widget',
  templateUrl: './social-widget.component.html',
  styleUrls: ['./social-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialWidgetComponent extends AbstractWidgetComponent implements OnInit {
  readonly appName: string = 'social';
  @Input() widget: Widget;

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,
    private editWidgetsService:EditWidgetsService,

  ) {
    super(injector);

    this.editWidgetsService.emitEventWithInterceptor(MessageNameEnum.BUSINESS_DEFAULT_SOCIAL_DATA);
  }

  ngOnInit(): void {

    this.editWidgetsService.defaultSocialSubject$.pipe(
      takeUntil(this.destroyed$),
      tap((data : SocialInterface[]) => {
        this.widget = {
          ...this.widget,
          data: data,
          openButtonFn: () => {
            this.onOpenButtonClick();

            return EMPTY;
          },
        };
        this.cdr.detectChanges();
      }),

    ).subscribe();
  }
}


