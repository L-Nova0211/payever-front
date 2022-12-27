import { Injectable } from '@angular/core';

import {
  PebAction,
  PebEffect,
  PebEffectTarget,
  pebGenerateId,
  PebPageEffect,
  PebPageVariant,
  PebShopEffect,
  PebShopRoute,
} from '@pe/builder-core';
import { PebEditorThemeService } from '@pe/builder-services';

import { PebSeoFormInterface } from './seo-form.interface';

@Injectable()
export class PebSeoFormService {
  constructor(private readonly pebEditorThemeService: PebEditorThemeService) { }

  public get isFrontPage(): boolean {
    return this.page.variant === PebPageVariant.Front;
  }

  public get page() {
    return this.pebEditorThemeService.page;
  }

  public get routing() {
    return this.pebEditorThemeService.snapshot.application.routing;
  }

  public createSeoChangesAction(valuesToUpdate: Partial<PebSeoFormInterface>): void {
    const pageId = this.page.id;
    const action = {
      id: pebGenerateId('action'),
      createdAt: new Date(),
      targetPageId: pageId,
      affectedPageIds: [pageId],
    };

    const propName = Object.keys(valuesToUpdate).pop();

    const prepareSeoChangesAction = (): PebAction => {
      const { name, url, ...seo } = valuesToUpdate;

      switch (propName) {
        case 'name':
          return {
            ...action,
            effects: [
              {
                payload: { name },
                type: PebPageEffect.Patch,
                target: `${PebEffectTarget.Pages}:${pageId}`,
              },
            ],
          };
        case 'url':
          const { applicationId, routeId = pebGenerateId() } = this.routing.find(r => r.pageId === pageId);
          const routesData: PebShopRoute[] = [{
            applicationId,
            pageId,
            routeId,
            url,
          }];

          const specialRoutesEffects: PebEffect[] = routesData
            .reduce((effects: PebEffect[], route) => {
              this.page?.variant === PebPageVariant.Category && effects.push({
                payload: { categoryPages: `${route.url}/:categoryId` },
                target: `${PebEffectTarget.Shop}`,
                type: PebShopEffect.UpdateData,
              });

              return effects;
            }, []);

          return {
            ...action,
            effects: [
              {
                payload: routesData,
                target: `${PebEffectTarget.Shop}`,
                type: PebShopEffect.PatchRouting,
              },
              ...specialRoutesEffects,
            ],
          };
        default:
          return {
            ...action,
            affectedPageIds: this.routing.map(page => page.pageId),
            effects: [
              {
                payload: {
                  data: { seo },
                },
                target: `${PebEffectTarget.Pages}:${pageId}`,
                type: PebPageEffect.Patch,
              },
            ],
          };
      }
    }

    propName && this.pebEditorThemeService.commitAction(prepareSeoChangesAction());
  }

  public getInitialSeoFormValues(): PebSeoFormInterface {
    const pageRoute = this.routing.find(route => route.pageId === this.page.id);

    const {
      description = '',
      showInSearchResults = false,
      canonicalUrl = '',
      markupData = '',
      customMetaTags = '',
    } = this.page?.data?.seo ?? { };

    return {
      name: this.page?.name,
      url: pageRoute ? pageRoute.url : '',
      description,
      showInSearchResults,
      canonicalUrl,
      markupData,
      customMetaTags,
    };
  }

  public isUrlOccupied(url: string): boolean {
    return this.routing.some(route => route.url === url && route.pageId !== this.page?.id);
  }
}
