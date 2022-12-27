import { Component, Injector, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { EMPTY } from 'rxjs';

import { TranslateService } from '@pe/i18n';
import { Widget } from '@pe/widgets';

import { AbstractWidgetComponent } from '../../abstract-widget.component';
@Component({
  selector: 'ads-widget',
  templateUrl: './ads-widget.component.html',
  styleUrls: ['./ads-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdsWidgetComponent extends AbstractWidgetComponent implements OnInit {
  @Input() widget: Widget;

  readonly installAppButtonText: string;
  readonly adsAppUrl: string = 'widgets.ads.url';
  readonly appName: string = 'ads';

  constructor(injector: Injector, private cdr: ChangeDetectorRef, private translateService: TranslateService,) {
    super(injector);
  }

  ngOnInit(): void {
    this.showSpinner$.next(false);

    this.widget.data = [
      {
        title: 'widgets.ads.install-app',
        isButton: true,
        icon: '',
        onSelect: () => {
          this.onOpenAdsClick();

          return EMPTY;
        },
      },
    ];
    this.cdr.detectChanges();
  }

  onOpenAdsClick(): void {
    this.router.navigate(['business', this.businessData._id, 'ads']);
  }
}
