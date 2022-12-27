import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, forkJoin, Subject } from 'rxjs';
import { filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import {
  isIntegrationAction,
  isIntegrationData,
  isIntegrationSelectLink,
  PebElementType,
  PebIntegration,
  PebIntegrationForm,
} from '@pe/builder-core';
import { PebEditorAccessorService } from '@pe/builder-services';

import { PebFunctionsFormService } from './functions-form.service';
import { PebFunctionsIntegrationForm } from './functions-integration/functions-integration.form';

@Component({
  selector: 'peb-functions-form',
  templateUrl: './functions.form.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    './functions.form.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebFunctionsForm implements OnInit, OnDestroy {

  formGroup: FormGroup;
  integrations: PebIntegration[];

  @Output() readonly blurred = new EventEmitter();

  readonly destroyed$ = new Subject<void>();
  private get editor() {
    return this.editorAccessorService.editorComponent;
  }

  functions: any;

  integrationTitleSubject$ = new BehaviorSubject<string>(null);
  integrationTitle$ = this.integrationTitleSubject$.asObservable();

  set integrationTitle(title: string) {
    this.integrationTitleSubject$.next(title);
  }

  differentElementTypes: PebElementType[];

  constructor(
    private editorAccessorService: PebEditorAccessorService,
    private functionsFormService: PebFunctionsFormService,
    private formBuilder: FormBuilder,
  ) {
    this.formGroup = this.formBuilder.group({
      integration: [],
      action: [],
      data: [],
      interaction: [],
    });
  }

  ngOnInit(): void {
    this.functionsFormService.elementFunctions$.pipe(
      tap(functions => this.functions = functions),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.functionsFormService.functions$.pipe(
      tap((value) => {
        if (value.length === 0) {
          this.integrationTitle = 'None';
        }

        if (value.length === 1) {
          const functionLink = value[0];
          let formValue;
          if (isIntegrationData(functionLink) || isIntegrationSelectLink(functionLink)) {
            formValue = { data: functionLink, integration: functionLink.integration };
          } else if (isIntegrationAction(functionLink)) {
            formValue = { action: functionLink, integration: functionLink.integration };
          } else {
            formValue = { interaction: functionLink, integration: functionLink.integration };
          }
          this.formGroup.patchValue(formValue, { emitEvent: false });
          this.formGroup.markAsPristine();
          this.formGroup.markAsUntouched();
          this.integrationTitle = functionLink.integration?.title?.replace('payever', '').trim();
        }

        if (value.length > 1) {
          this.integrationTitle = 'Multiple functions';
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.formGroup.valueChanges.pipe(
      switchMap((value: PebIntegrationForm) => this.functionsFormService.setFunctions(value).pipe(
        switchMap(obs => forkJoin(obs)),
        tap(() => {
          const valueTransformed = value.integration?.title?.toLowerCase().replace('payever', '').trim();
          this.integrationTitle = valueTransformed;
        }),
      )),
      tap(() => {
        this.formGroup.setValue({
          integration: null,
          action: null,
          data: null,
          interaction: null,
        }, { emitEvent: false });
        this.formGroup.markAsPristine();
        this.formGroup.markAsUntouched();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  pick(): void {
    this.functionsFormService.getFilterActions().pipe(
      take(1),
      tap(() => {
        this.editor.detail = { back: 'Back', title: 'Function' };
        const sidebarCmpRef = this.editor.insertToSlot(PebFunctionsIntegrationForm, PebEditorSlot.sidebarDetail);
        sidebarCmpRef.instance.formGroup = this.formGroup;
        sidebarCmpRef.instance.functions = this.functions;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
