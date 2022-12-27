import { Component, EventEmitter, Injector, Input, Output, ViewEncapsulation } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FormAbstractComponent, FormScheme } from '@pe/forms';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { KeysStateService } from '../../services';

interface ApiKeyFormInterface {
  key: {
    name: string,
  };
}

@Component({
  selector: 'plugin-api-key-add',
  templateUrl: './plugin-api-key-add.component.html',
  styleUrls: ['./plugin-api-key-add.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PluginApiKeyAddComponent extends FormAbstractComponent<ApiKeyFormInterface> {

  @Input() name: string = null;
  @Output() created: EventEmitter<void> = new EventEmitter();

  formStorageKey = 'shopsystems-add-keys';
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  formScheme: FormScheme = {
    fieldsets: {
      key: [
        {
          name: 'name',
          type: 'input',
          fieldSettings: {
            classList: 'col-xs-12 opacity-03 no-border-radius',
            required: true,
          },
        },
      ],
    },
  };

  private activatedRoute: ActivatedRoute = this.injector.get(ActivatedRoute);
  private router: Router = this.injector.get(Router);

  protected stateService: KeysStateService = this.injector.get(KeysStateService);
  protected snackBarService: SnackbarService = this.injector.get(SnackbarService);
  protected translateService: TranslateService = this.injector.get(TranslateService);

  constructor(
    injector: Injector
  ) {
    super(injector);
  }


  protected createForm(initialData: ApiKeyFormInterface): void {
    setTimeout(() => {
      this.createFormDeffered(this.initialData);
    });
  }

  protected createFormDeffered(initialData: ApiKeyFormInterface): void {
    this.form = this.formBuilder.group({
      key: this.formBuilder.group({
        name: ['', Validators.required],
      }),
    });

    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formsValues: ApiKeyFormInterface) {
    this.snackBarService.toggle(false);
  }

  protected onSuccess() {
    this.isLoading$.next(true);
    const keyName = this.form.get('key').get('name').value;
    this.stateService.addPluginApiKey(this.name, keyName).pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.isLoading$.next(false);
      this.form.reset();
      this.created.emit();
    }, (error) => {
      this.stateService.handleError(error, true);
      this.isLoading$.next(false);
    });
  }
}
