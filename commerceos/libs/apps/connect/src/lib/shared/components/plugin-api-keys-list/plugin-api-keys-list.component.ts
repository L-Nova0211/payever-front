import { Component, EventEmitter, Injector, Input, Output, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ResponseErrorsInterface } from '../../http-interceptors';
import { AuthTokenInterface } from '../../interfaces';
import { BusinessService } from '../../services';
import { ApiKeysBaseComponent } from '../api-keys-base.component';

@Component({
  selector: 'plugin-api-keys-list',
  templateUrl: './plugin-api-keys-list.component.html',
  styleUrls: ['./plugin-api-keys-list.component.scss'],
})
export class PluginApiKeysListComponent extends ApiKeysBaseComponent {

  @Input('name') set setName(name: string) {
    if (this.name !== name) {
      this.name = name;
      this.error$ = this.stateService.getPluginApiKeysError(name).pipe(takeUntil(this.destroyed$));
      this.apiKeys$ = this.stateService.getPluginApiKeys(name).pipe(takeUntil(this.destroyed$));
    }
  }

  @Input('template') template: TemplateRef<any>;
  @Output() removed: EventEmitter<void> = new EventEmitter();

  name: string = null;
  error$: Observable<ResponseErrorsInterface> = of(null); // TODO Type
  apiKeys$: Observable<AuthTokenInterface[]> = of(null);
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    injector: Injector,
    private businessService: BusinessService
  ) {
    super(injector);
  }

  get businessUuid(): string {
    return this.businessService.businessId;
  }

  removeKey(key: AuthTokenInterface, event: Event): void {
    event.stopPropagation();
    if (!this.isLoading$.getValue()) {
      this.isLoading$.next(true);
      this.stateService.removePluginApiKey(this.name, key.id).subscribe(() => {
        this.isLoading$.next(false);
        this.showMessage(this.translateService.translate(
        'categories.shopsystems.api_keys.default.messages.key_was_removed'));
        this.removed.emit();
      }, (error) => {
        this.stateService.handleError(error, true);
        this.isLoading$.next(false);
      });
    }
  }
}
