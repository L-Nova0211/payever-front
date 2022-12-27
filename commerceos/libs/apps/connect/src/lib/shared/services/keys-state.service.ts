import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { flatMap, take, map } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { ResponseErrorsInterface } from '../../shared/http-interceptors/catch-error-interceptor';
import { BusinessService } from '../../shared/services/business.service';
import { AuthTokenInterface } from '../interfaces/token.interface';

import { KeysApiService } from './keys-api.service';

@Injectable()
export class KeysStateService {

  private apiKeysBusinessUuid: string = null;
  private apiKeysList: {[key: string]: {
      subject: BehaviorSubject<AuthTokenInterface[]>,
      subjectError: BehaviorSubject<ResponseErrorsInterface>, // TODO Type
      processed: boolean
    }} = {};

  private businessService: BusinessService = this.injector.get(BusinessService);
  private apiService: KeysApiService = this.injector.get(KeysApiService);
  private translateService: TranslateService = this.injector.get(TranslateService);

  constructor(
    private injector: Injector
  ) {}

  getCacheKey(business: string, integration: string): string {
    return `${business}_${integration}`;
  }

  getPluginApiKeysError(integration: string): Observable<ResponseErrorsInterface> {
    const business = this.businessService.businessId;
    const name = this.getCacheKey(business, integration);
    if (!this.apiKeysList[name]) {
      this.apiKeysList[name] = {
        subject: new BehaviorSubject<AuthTokenInterface[]>(null),
        subjectError: new BehaviorSubject<ResponseErrorsInterface>(null),
        processed: false,
      };
    }

    return this.apiKeysList[name].subjectError.asObservable();
  }

  getPluginApiKeys(integration: string, reset: boolean = false): Observable<AuthTokenInterface[]> {
    const business = this.businessService.businessId;
    const name = this.getCacheKey(business, integration);
    this.getPluginApiKeysError(integration); // To init key in this.apiKeysList
    if (!this.apiKeysList[name].processed || reset || this.apiKeysBusinessUuid !== business) {
      this.apiKeysBusinessUuid = business;
      this.apiKeysList[name].processed = true;
      this.apiKeysList[name].subjectError.next(null);
      this.apiKeysList[name].subject.next(null);

      this.apiService.getPluginApiKeys(business, integration).subscribe(
        (keyIds: string[]) => {
          (keyIds && keyIds.length ? this.apiService.getOAuthKeyDetails(business, keyIds) : of([])).subscribe(
            (fullKeys) => {
              this.apiKeysList[name].subject.next(fullKeys || []);
            },
            (error) => {
              this.apiKeysList[name].subjectError.next(error);
              this.apiKeysList[name].processed = false;
            }
          );
        },
        (error) => {
          this.apiKeysList[name].subjectError.next(error);
          this.apiKeysList[name].processed = false;
        }
      );
    }

    return this.apiKeysList[name].subject.asObservable();
  }

  addPluginApiKey(integration: string, keyName: string): Observable<AuthTokenInterface> {
    const business = this.businessService.businessId;

    return this.apiService.createOAuthKey(business, keyName).pipe(flatMap((keyData: AuthTokenInterface) => {
      return this.apiService.addPluginApiKey(business, integration, keyData.id).pipe(
        flatMap((data) => {
          return this.getPluginApiKeys(integration, true).pipe(take(1), map(() => {
            return data;
          }));
        })
      );
    }));
  }

  removePluginApiKey(integration: string, id: string): Observable<void> {
    const business = this.businessService.businessId;

    return this.apiService.removeOAuthKey(business, id).pipe(
      flatMap((data) => {
        return this.getPluginApiKeys(integration, true).pipe(take(1), map(() => {
          return data;
        }));
      })
    );
  }

  handleError(error: any, showSnack?: boolean): void { // TODO Remove copypaste
    if (!error.message) {
      error.message = this.translateService.translate('errors.unknown_error');
    }
    if (error.status === 403 || error.statusCode === 403 || error.code === 403) {
      error.message = this.translateService.translate('errors.forbidden');
    }
    if (showSnack) {
      const snackBarService: SnackbarService = this.injector.get(SnackbarService);
      snackBarService.toggle(true, error.message || this.translateService.translate('errors.unknown_error'), {
        data: {
          duration: 5000,
          iconId: 'icon-alert-24',
          iconSize: 24,
        },
      });
    }
  }
}
