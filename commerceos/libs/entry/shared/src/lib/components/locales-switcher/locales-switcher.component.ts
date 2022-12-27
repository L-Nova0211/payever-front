import { Component, EventEmitter, Injector, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { filter, skip, take, takeUntil, tap } from 'rxjs/operators';

import { LocaleInterface } from '@pe/i18n-core';
import { TranslationLoaderService } from '@pe/i18n-core';
import { LocaleService } from '@pe/i18n-core';
import { retrieveLocale } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { CosLocaleListComponent } from '../locale-list/locale-list.component';


@Component({
  selector: 'cos-locales-switcher',
  templateUrl: './locales-switcher.component.html',
  styleUrls: ['./locales-switcher.component.scss']
})
export class CosLocalesSwitcherComponent implements OnDestroy {

  @Input() transparent: boolean = false;
  @Input() dark: boolean = false;
  @Input() reloadPageOnSwitch: boolean = true;
  @Input() allowedLocales: string[] = null;

  @Output() localeChanged: EventEmitter<void> = new EventEmitter<void>();

  locales: LocaleInterface[] = [];
  currentLocale: LocaleInterface;

  @ViewChild('matMenuTrigger') matMenuTrigger: MatMenuTrigger;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject();

  private translationLoaderService: TranslationLoaderService = this.injector.get(TranslationLoaderService);
  private localeService: LocaleService = this.injector.get(LocaleService);

  constructor(
    private injector: Injector,
    private peOverlayWidgetService: PeOverlayWidgetService,
  ) {}

  ngOnInit(): void {
    this.localeService.locales$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        locales => {
          const lang: string = retrieveLocale();
          this.locales = this.filterLocales(locales);
          this.currentLocale = locales.find(a => a.code === lang) || locales[0];
        }
      );
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  changeLocale(locale: LocaleInterface): void {
    if (this.reloadPageOnSwitch) {
      this.localeService.changeCurrentLocale(locale.code);
    } else {
      this.localeService.currentLocale$.next(locale);
      this.translationLoaderService.reloadTranslations(locale.code).subscribe(() => {
        this.localeChanged.emit();
      });
    }
  }

  openOverlay(): void {
    const onSaveSubject$ = new BehaviorSubject<any>(null);
    const peOverlayConfig: PeOverlayConfig = {
      data: {
        currentLocale: this.currentLocale,
        locales: this.locales,
      },
      headerConfig: {
        hideHeader: true,
        title: '',
        theme: 'dark',
        onSaveSubject$: onSaveSubject$,
      },
      component: CosLocaleListComponent,
      backdropClick: () => { return false },
    }

    const peOverlayRef: PeOverlayRef = this.peOverlayWidgetService.open(peOverlayConfig);

    onSaveSubject$.pipe(
      skip(1),
      take(1),
      tap((locale => {
        if (locale && (locale.code !== this.currentLocale.code)) {
          this.changeLocale(locale);
        }

        peOverlayRef.close();
      }))
    ).subscribe();
  }

  private filterLocales(locales: LocaleInterface[]): LocaleInterface[] {
    if (this.allowedLocales && this.allowedLocales.length > 0) {
      locales = locales.filter(a => this.allowedLocales.indexOf(a.code) >= 0);
    }
    return locales;
  }
}
