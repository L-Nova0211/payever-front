import {
  ApplicationRef,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Injector,
  ViewContainerRef,
} from '@angular/core';
import merge from 'lodash/merge';
import { combineLatest, forkJoin, Observable, ReplaySubject } from 'rxjs';
import { delay, first, map, tap } from 'rxjs/operators';

import { pebCreateLogger, PebElementDef, PebScreen, PebShop, PebThemePageInterface } from '@pe/builder-core';
import { FontLoaderService } from '@pe/builder-font-loader';
import { PebRenderer } from '@pe/builder-renderer';
import { ContextBuilder } from '@pe/builder-services';

const observeOnMutation = (target, config): Observable<MutationRecord[]> => {
  return new Observable((observer) => {
    const mutation = new MutationObserver((mutations, instance) => {
      observer.next(mutations);
    });
    mutation.observe(target, config);

    return () => {
      mutation.disconnect();
    };
  });
};


const log = pebCreateLogger('sandbox:prepare');

@Injectable({ providedIn: 'any' })
export class PrepareShopService {

  logger = { log };

  constructor(
    private applicationRef: ApplicationRef,
    private resolver: ComponentFactoryResolver,
    private fontLoaderService: FontLoaderService,
    private contextManager: ContextBuilder,
  ) {}

  replaceAllStylesWithGrid(theme: PebShop): Observable<PebShop> {
    const container = this.applicationRef.components[0].instance.viewContainerRef;

    this.fontLoaderService.renderFontLoader();

    return forkJoin(theme.pages.map((page) => {
      return forkJoin(Object.values(PebScreen).map((screen) => {
        return this.createRendererForPage(
          container,
          page,
          screen,
        ).pipe(
          map(rendererRef => ({ [screen as string]: this.calculateStylesForPage(rendererRef, page) })),
        );
      })).pipe(
        map((stylesheetsArrays) => {
          const stylesheets = stylesheetsArrays.reduce((acc, stylesheet) => ({ ...acc, ...stylesheet }), {});
          Object.keys(stylesheets).map((screen) => {
            page.stylesheets = {
              ...page.stylesheets,
              [screen]: {
                ...page.stylesheets[screen],
                ...stylesheets[screen],
              },
            };
          });

          return page;
        }),
      );
    })).pipe(
      map(pages => ({ ...theme, pages })),
    );
  }

  private calculateStylesForPage(
    rendererRef: ComponentRef<PebRenderer>,
    page: PebThemePageInterface,
  ) {
    const elementsWithChildren = this.flat(
      rendererRef.instance.registry.get(page.template.id).element,
    ).filter(el => !!el?.children?.length);

    const updatedStyles = elementsWithChildren.reduce(
      (acc, el) => {
        const changes = el.children
          .filter(child => !!child)
          .map((child) => {
            return { [child.id]: page.stylesheets[PebScreen.Desktop]?.[child.id] };
          });

        return merge(acc, changes);
      },
      {},
    );

    rendererRef.destroy();

    return updatedStyles;
  }

  private createRendererForPage(
    container: ViewContainerRef,
    page: PebThemePageInterface,
    screen: PebScreen,
  ): Observable<ComponentRef<PebRenderer>> {
    const factory: ComponentFactory<PebRenderer> = this.resolver.resolveComponentFactory(PebRenderer);
    const cmpInjector = Injector.create({
      parent: container.injector,
      providers: [
        {
          provide: 'RENDERER_SETTINGS',
          useValue: {
            dimensions: {
              desktop: 1280,
              tablet: 768,
              mobile: 360,
            },
          },
        },
      ],
    });

    const cmpRef: ComponentRef<PebRenderer> = factory.create(cmpInjector);

    cmpRef.location.nativeElement.setAttribute(
      'style',
      `
        display: block;
        min-width: ${screen === PebScreen.Desktop ? 1280 : screen === PebScreen.Tablet ? 768 : 360}px;
        width: ${screen === PebScreen.Desktop ? 1280 : screen === PebScreen.Tablet ? 768 : 360}px;
        overflow: hidden;
      `,
    );

    cmpRef.instance.options.screen = screen;
    cmpRef.instance.element = page.template;
    cmpRef.instance.stylesheet = page.stylesheets[screen];
    cmpRef.instance.context = {
      ...this.contextManager.rootState,
      ...this.contextManager.buildSchema(page.context),
    };

    const rendered$ = new ReplaySubject<void>(1);
    observeOnMutation(cmpRef.location.nativeElement, { childList: true }).pipe(
      tap(() => {
        rendered$.next();
      }),
    ).subscribe();

    container.insert(cmpRef.hostView);

    return combineLatest([cmpRef.instance.rendered, rendered$]).pipe(
      first(),
      delay(1000), // TODO: Wrong grid calculations for video because not fully rendered yet
      tap(() => {
        this.logger.log(`Create page for ${screen}`, page);
      }),
      map(() => cmpRef),
    );
  }

  private flat(element: PebElementDef): PebElementDef[] {
    return element.children?.reduce(
      (acc, el) => ([
        ...acc,
        el,
        ...(el?.children ? this.flat(el) : []),
      ]),
      [],
    );
  }

}
