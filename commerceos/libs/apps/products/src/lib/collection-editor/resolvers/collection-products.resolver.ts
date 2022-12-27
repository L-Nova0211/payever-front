import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { FieldFilterKey } from '../../shared/enums/filter.enum';
import { Collection } from '../../shared/interfaces/collection.interface';
import { Filter } from '../../shared/interfaces/filter.interface';
import { ProductsApiService } from '../../shared/services/api.service';
import { CollectionSectionsService } from '../services/sections.service';

@Injectable()
export class CollectionProductsResolver implements Resolve<Collection> {

  constructor(
    private api: ProductsApiService,
    private sectionsService: CollectionSectionsService,
    private router: Router,
    private envService: EnvService,
    private snackBarService: SnackbarService,
    private translateService: TranslateService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<Collection> {
    const needToLoadProducts: boolean = this.sectionsService.resetState$.value;
    if (route.params.collectionId && needToLoadProducts) {
      const filters: Filter[] = [{
        key: FieldFilterKey.Collections,
        condition: 'is',
        value: route.params.collectionId,
      }];

      return this.api.getProducts(this.envService.businessId, filters).pipe(
        tap((data) => {
          if (!data) {
            this.navigateToListAndShowError();
          }}),
        map(products => products.data.getProducts.products),
        catchError((error: HttpErrorResponse) => {
          console.error('RESOLVE PRODUCTS OF COLLECTION / ERROR', error); /* tslint:disable-line:no-console */

          return [null];
        }));
    } else {
      return of(null);
    }
  }

  private navigateToListAndShowError(): void {
    const url: string[] = ['business', this.envService.businessId, 'products', 'list'];
    this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' })
      .then(() => {
        this.snackBarService.toggle(
          true,
          {
            content: this.translateService.translate('snack_bar_exceptions.products_not_exist'),
            duration: 5000,
            iconId: 'icon-alert-24',
            iconSize: 24,
          },
        );
      });
  }

}
