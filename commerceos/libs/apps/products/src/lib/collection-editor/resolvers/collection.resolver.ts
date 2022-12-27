import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { CollectionModel } from '../../shared/interfaces/collection-model';
import { Collection } from '../../shared/interfaces/collection.interface';
import { ProductsApiService } from '../../shared/services/api.service';
import { ConditionsType } from '../enums';
import { CollectionSectionsService } from '../services';

@Injectable()
export class CollectionResolver implements Resolve<CollectionModel> {
  constructor(
    private api: ProductsApiService,
    private sectionsService: CollectionSectionsService,
    private router: Router,
    private envService: EnvService,
    private snackBarService: SnackbarService,
    private translateService: TranslateService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<CollectionModel> {
    const collectionId: string = route.params.collectionId;
    const needToLoadCollection: boolean = this.sectionsService.resetState$.value;
    if (collectionId && needToLoadCollection) {
      return this.api.getCollection(collectionId, this.envService.businessId).pipe(
        tap((collection) => {
          if (!collection) {
            this.navigateToListAndShowError();
          }
        }),
        map((collection: Collection) => {
          const collectionModel: CollectionModel = {
            _id: collection._id,
            name: collection.name,
            description: collection.description,
            image: collection.image,
            images: [],
            products: [],
            parent: collection.parent,
          };
          if (collection.automaticFillConditions && collection.automaticFillConditions.filters?.length) {
            collectionModel.conditions = {
              type: collection.automaticFillConditions.strict
                ? ConditionsType.AllConditions
                : ConditionsType.AnyCondition,
              filters: collection.automaticFillConditions.filters.map((filter) => {
                return {
                  key: filter.field,
                  condition: filter.fieldCondition,
                  value: filter.value,
                };
              }),
            };
          } else {
            collectionModel.conditions = {
              type: ConditionsType.NoCondition,
              filters: [],
            };
          }

          return collectionModel;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('RESOLVE COLLECTION / ERROR', error); /* tslint:disable-line:no-console */

          return [null];
        }),
      );
    } else {
      return of(null);
    }
  }

  private navigateToListAndShowError(): void {
    const url: string[] = ['business', this.envService.businessId, 'products', 'list'];
    this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' }).then(() => {
      this.snackBarService.toggle(
        true,
        {
          content: this.translateService.translate('snack_bar_exceptions.collection_not_exist'),
          duration: 5000,
          iconId: 'icon-alert-24',
          iconSize: 24,
        },
      );
    });
  }
}
