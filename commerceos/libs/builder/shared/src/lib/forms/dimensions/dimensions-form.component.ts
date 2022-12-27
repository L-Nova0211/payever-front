import { ChangeDetectionStrategy, Component, Input, NgZone, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApmService } from '@elastic/apm-rum-angular';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, first, map, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PebSelectionBBox, PebSelectionBBoxState } from '@pe/builder-controls';
import { PebElementDef } from '@pe/builder-core';
import { PebElementSelectionState } from '@pe/builder-state';
import { PeDestroyService } from '@pe/common';

import { PebDimensionsFormService } from './dimensions-form.service';


@Component({
  selector: 'peb-dimensions-form',
  templateUrl: './dimensions-form.component.html',
  styleUrls: ['./dimensions-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebDimensionsForm implements OnInit {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebSelectionBBoxState.boundingBox) selection$!: Observable<PebSelectionBBox>;

  @Input() showConstrain = false;

  constrainProportions = false;
  dimensionsForm = this.formBuilder.group({ height: 0, width: 0, constrainProportions: false });
  previousValue: { height: number, width: number, constrainProportions: boolean };
  ratio: number;

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly dimensionsFormService: PebDimensionsFormService,
    private readonly formBuilder: FormBuilder,
    private readonly ngZone: NgZone,
    private readonly apmService: ApmService,
  ) {
  }

  ngOnInit() {
    this.ngZone.onStable.pipe(
      first(),
      switchMap(() => this.selection$.pipe(
        withLatestFrom(this.selectedElements$),
        tap(([selection, selectedElements]) => {
          const { height, width } = selection;
          let constrainProportions = false;

          selectedElements.forEach((element) => {
            if (element.data?.constrainProportions) {
              this.showConstrain = true;
              constrainProportions = true;
            }
          });

          /***
           * This code is needed to height the missing top error. If the error does not occur, delete after 05/15/2022
           */
          if (height === undefined) {
            try {
              throw new Error('Missing height');
            } catch (e) {
              this.apmService.apm.captureError(
                `height must not be undefined:\n ${JSON.stringify({ selection, selectedElements })}`,
              );
            }

            return;
          };

          this.dimensionsForm.setValue({ height, width, constrainProportions });
          this.previousValue = { height, width, constrainProportions };
          this.ratio = height <= 0 ? 1 : width / height;
        }),
        switchMap(() => this.dimensionsForm.valueChanges),
        filter(() => this.dimensionsForm.dirty),
        map((value) => {
          const dirty: { [key: string]: boolean } = Object.keys(value).reduce((acc, key) => {
            return { ...acc, [key]: this.dimensionsForm.get(key).dirty };
          }, {});

          if (dirty.constrainProportions) {
            this.ratio = value.height <= 0 ? 1 : value.width / value.height;
          } else {
            if (value.constrainProportions) {
              if (dirty.height) {
                value.width = Math.round(value.height * this.ratio);
              }

              if (dirty.width) {
                value.height = Math.round(value.width / this.ratio);
              }
            }
          }

          this.dimensionsForm.patchValue(value, { emitEvent: false });

          return [dirty, value];
        }),
        tap(() => {
          this.dimensionsForm.markAsPristine();
        }),
        switchMap(([dirty, value]) => this.dimensionsFormService.setDimensions(dirty, value)),
        tap((valid) => {

          if (valid) {
            this.previousValue = this.dimensionsForm.value;
          } else {
            setTimeout(() => {
              this.dimensionsForm.patchValue(this.previousValue, { emitEvent: false })
            })
          }

          if (this.dimensionsForm.touched) {
            this.dimensionsForm.markAsUntouched();
          }
        }),
        takeUntil(this.destroy$),
      )),
    ).subscribe();
  }
}
