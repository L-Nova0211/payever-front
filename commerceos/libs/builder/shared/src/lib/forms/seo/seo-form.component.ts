import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn } from '@angular/forms';
import { map, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { PebSeoFormInterface } from './seo-form.interface';
import { PebSeoFormService } from './seo-form.service';

@Component({
  selector: 'peb-seo-form',
  templateUrl: './seo-form.component.html',
  styleUrls: ['./seo-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebSeoForm implements OnInit {

  public readonly seoForm = this.formBuilder.group({
    canonicalUrl: [''],
    customMetaTags: [''],
    description: [''],
    markupData: [''],
    name: [''],
    showInSearchResults: [''],
    url: [
      {
        value: '',
        disabled: this.pebSeoFormService.isFrontPage,
      }, {
        validators: [this.occupiedUrlValidator],
      },
    ],
  }, { updateOn: 'blur' });

  private readonly watchSeoFormChanges$ = this.seoForm
    .valueChanges
    .pipe(
      map(() => Object.entries(this.seoForm.controls).reduce((
        seoFormValues: Partial<PebSeoFormInterface>,
        [controlName, control],
      ) => {
        control.dirty
          && control.valid
          && Object.assign(seoFormValues, { [controlName]: control.value })
          && control.markAsPristine();

        return seoFormValues;
      }, { })),
      tap((seoFormValues) => {
        this.pebSeoFormService.createSeoChangesAction(seoFormValues);
      }));

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly destroy$: PeDestroyService,
    private readonly pebSeoFormService: PebSeoFormService,
  ) { }

  private get occupiedUrlValidator(): ValidatorFn {
    return (control: AbstractControl) => this.pebSeoFormService.isUrlOccupied(control.value)
      ? { occupied: { value: control.value } }
      : null;
  }

  ngOnInit(): void {
    const initialSeoFormValues = this.pebSeoFormService.getInitialSeoFormValues();

    this.seoForm.patchValue(initialSeoFormValues, { emitEvent: false });
    this.watchSeoFormChanges$.pipe(takeUntil(this.destroy$)).subscribe();
  }
}
