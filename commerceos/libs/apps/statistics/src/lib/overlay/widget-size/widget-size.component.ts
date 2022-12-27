import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_CONFIG } from '@pe/overlay-widget';

import { PeWidgetService, ucfirst } from '../../infrastructure';

export interface SizeOptions {
  size: string;
  graphView: [number, number];
}

@Component({
  selector: 'peb-widget-size',
  templateUrl: './widget-size.component.html',
  styleUrls: ['./widget-size.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeStatisticsWidgetSizeComponent implements OnInit {
  /** Widget type */
  viewType;

  ucfirst = ucfirst;

  form = new FormGroup({
    size: new FormControl(null),
  });

  readonly destroyed$ = new ReplaySubject<boolean>();

  /** Widget size options */
  sizeOptions: SizeOptions[] = [];

  constructor(
    private widgetService: PeWidgetService,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    private translateService: TranslateService,
  ) {
    this.overlayConfig.title = this.translateService.translate('statistics.overlay_titles.add_widget');
    if (this.widgetService.viewType === this.widgetService.widgetType.DetailedNumbers) {
      this.widgetService.selectedWidgetSize = this.widgetService.widgetSize.Medium;
    } else {
      this.widgetService.selectedWidgetSize = this.widgetService.widgetSize.Small;
    }

    this.widgetService.viewType$
      .pipe(
        tap((viewType) => {
          this.viewType = viewType;
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  /** Changes selected widget size */
  onSizeChange(event: any) {
    this.widgetService.selectedWidgetSize = event.tab.textLabel.toLowerCase();
  }

  ngOnInit(): void {
    if (this.widgetService.viewType !== this.widgetService.widgetType.DetailedNumbers) {
      this.sizeOptions.push({
        size: this.widgetService.widgetSize.Small,
        graphView: [158, 57],
      });
    }
    this.sizeOptions = [
      ...this.sizeOptions,
      {
        size: this.widgetService.widgetSize.Medium,
        graphView: [308, 57],
      },
      {
        size: this.widgetService.widgetSize.Large,
        graphView: [308, 205],
      },
    ];
  }
}
