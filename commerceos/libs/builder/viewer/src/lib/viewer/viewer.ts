import { HashLocationStrategy, isPlatformBrowser, Location, LocationStrategy } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Injectable,
  Input,
  OnChanges,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { animationFrameScheduler, BehaviorSubject, combineLatest, EMPTY, of, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  finalize,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
  throttleTime,
} from 'rxjs/operators';

import {
  applyRecursive,
  PebInteractionType,
  PebLanguage,
  PebScreen,
  pebScreenDocumentWidthList,
  PebShop,
  PebThemeDetailInterface,
  PebThemePageInterface,
  snapshotToSourceConverter,
} from '@pe/builder-core';
import { fromResizeObserver, PebRenderer } from '@pe/builder-renderer';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { ContextBuilder } from '../services/context.service';
import { SCREEN_FROM_WIDTH } from '../viewer.constants';
import { fromLocationUrlChange, getThemePageByLocation } from '../viewer.utils';

@Injectable()
export class ViewerLocationStrategy extends HashLocationStrategy {
  prepareExternalUrl(internal: string): string {
    return `${(this as any)._platformLocation.location.pathname}#${internal}`;
  }
}


@Component({
  selector: 'peb-viewer',
  templateUrl: './viewer.html',
  styleUrls: ['./viewer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    Location,
    {
      provide: LocationStrategy,
      useClass: ViewerLocationStrategy,
    },
  ],
})
export class PebViewer implements OnChanges, AfterViewInit {
  hostWidth: number;
  scale = 1;

  @Input()
  themeSnapshot: { snapshot: PebThemeDetailInterface, pages: PebThemePageInterface[] };

  @Input()
  themeCompiled: PebShop;

  @Input() set locale(locale: PebLanguage) {
    this.locale$.next(locale);
  }

  @Input() screen: PebScreen;

  @Output() interacted = new EventEmitter();

  @ViewChild(PebRenderer) renderer: PebRenderer;

  readonly viewInit$ = new Subject<void>();

  readonly theme$ = new BehaviorSubject(null);

  readonly locale$ = new BehaviorSubject<PebLanguage>(PebLanguage.English);

  readonly defaultLocale$ = new BehaviorSubject<PebLanguage>(PebLanguage.English);

  readonly screen$ = this.viewInit$.pipe(
    switchMap(() => fromResizeObserver(this.elementRef.nativeElement)),
    map((hostDss: Partial<DOMRectReadOnly>) => {
      this.hostWidth = hostDss.width;
      const screen = this.screenFromWidth(hostDss.width);
      const result = this.screen || screen;
      this.scale = this.hostWidth > pebScreenDocumentWidthList[result]
        ? 1
        : this.hostWidth / pebScreenDocumentWidthList[result];

      return result;
    }),
    throttleTime(100, animationFrameScheduler, { trailing: true }),
    tap(() => this.cdr.detectChanges()),
    distinctUntilChanged(),
    shareReplay(1),
  );

  readonly location$ = fromLocationUrlChange(this.location).pipe(
    startWith(null as object),
    map(() => (isPlatformBrowser(this.platformId) ? window.location.hash.replace(/^#/, '') : '')),
  );

  readonly pageSnapshot$ = combineLatest([this.theme$, this.contextBuilder.state$]).pipe(
    filter(([theme]) => !!theme),
    switchMap(([theme, state]: [PebShop, any]) => combineLatest([of(theme), of(state), this.location$])),
    switchMap(([theme, state, location]) => {
      this.locale = theme?.data?.defaultLanguage ??
        (theme as any)?.application?.data?.defaultLanguage ?? PebLanguage.English;
      this.defaultLocale$.next(theme?.data?.defaultLanguage ??
        (theme as any)?.application?.data?.defaultLanguage ?? PebLanguage.English);
      const href = isPlatformBrowser(this.platformId) ? window.location.href : '';
      const url = new URL(href);
      const pageId = url.searchParams.get('pageId');
      // TODO: refactor using activatedRoute
      if (pageId) {
        const route = theme.routing.find(r => r.pageId === pageId);
        location = route?.url ?? location;
      }
      const page = getThemePageByLocation(theme, location || '/');
      if (!page) {
        this.location.go('/');

        return EMPTY;
      }
      this.location.go(location);

      return of({ theme, page, state });
    }),
    switchMap(snap =>
      combineLatest([
        of(snap.theme),
        of(snap.page),
        of(snap.state),
        this.screen$,
        this.contextBuilder.buildSchema(snap.page?.context) || of(null),
        this.contextBuilder.buildSchema(snap.theme?.context) || of(null),
      ]),
    ),
    switchMap(async ([theme, page, state, screen, pageSchema, themeSchema]) => {
      page.template = await applyRecursive(page, page.template, this.env);
      const stylesheet = page.stylesheets[this.screen] || page.stylesheets[screen];
      const resultScreen = this.screen || screen;
      this.scale = this.hostWidth > pebScreenDocumentWidthList[resultScreen] ?
          1 : this.hostWidth / pebScreenDocumentWidthList[resultScreen];

      return {
        screen: this.screen ?? screen,
        template: page.template,
        stylesheet: stylesheet || {},
        context: { ...state, ...themeSchema, ...(pageSchema as any) },
      };
    }),
    shareReplay(1),
  );

  constructor(
    @Inject(SCREEN_FROM_WIDTH) private screenFromWidth: any,
    @Inject(PLATFORM_ID) private platformId: string,
    private contextBuilder: ContextBuilder,
    private location: Location,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.themeSnapshot && this.themeCompiled) {
      throw new Error('Viewer accepts either snapshot or compiled theme. You should not provide both');
    }

    if (changes.themeSnapshot || changes.themeCompiled || changes.screen) {
      this.theme$.next(this.themeCompiled || snapshotToSourceConverter(this.themeSnapshot));
    }
  }

  ngAfterViewInit() {
    this.viewInit$.next();

    this.cdr.markForCheck();
  }

  onRendererInteraction(evt) {
    if (evt.type === PebInteractionType.ChangeLanguage) {
      this.locale$.next(evt.payload);
    }

    if (evt.type === 'navigate.internal-page' && evt.path != null) {
      this.renderer.applyBuildOutAnimation().pipe(
        finalize(() => this.location.go(evt.path)),
      ).subscribe();

      return;
    }

    this.interacted.emit(evt);
  }
}
