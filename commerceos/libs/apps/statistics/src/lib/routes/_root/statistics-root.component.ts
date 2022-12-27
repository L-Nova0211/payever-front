import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

import { TranslationLoaderService } from '@pe/i18n-core';

import { StatisticsHeaderService } from '../../infrastructure';

@Component({
  selector: 'pe-statistics',
  templateUrl: './statistics-root.component.html',
  styleUrls: ['./statistics-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeStatisticsComponent implements OnInit, OnDestroy {
  protected destroyed$ = new ReplaySubject<boolean>();

  /** Whether translation is ready or not */
  translationsReady$ = new BehaviorSubject(false);
  constructor(
    private headerService: StatisticsHeaderService,
    private translationLoaderService: TranslationLoaderService,
  ) {}

  ngOnInit(): void {
    this.headerService.init();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
