import { ChangeDetectionStrategy, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApmService } from '@elastic/apm-rum-angular';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, first, map, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PebControlsService, PebRadiusService, PebSelectionBBox, PebSelectionBBoxState } from '@pe/builder-controls';
import { PebElementDef, PebScreen, pebScreenContentWidthList, pebScreenDocumentWidthList } from '@pe/builder-core';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';
import { PebElementSelectionState } from '@pe/builder-state';
import { PeDestroyService } from '@pe/common';

import { PebPositionFormService } from './position-form.service';


@Component({
  selector: 'peb-position-form',
  templateUrl: './position-form.component.html',
  styleUrls: ['./position-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebPositionForm implements OnInit {

  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebSelectionBBoxState.boundingBox) selection$!: Observable<PebSelectionBBox>;
  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;

  positionForm = this.formBuilder.group({ x: 0, y: 0 });
  previousValue: { x: number, y: number };

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly formBuilder: FormBuilder,
    private readonly positionFormService: PebPositionFormService,
    private readonly ngZone: NgZone,
    private readonly controlsService: PebControlsService,
    private readonly radiusService: PebRadiusService,
    private readonly tree: PebRTree<PebAbstractElement>,
    private readonly apmService: ApmService,
  ) {
  }

  ngOnInit(): void {
    this.ngZone.onStable.pipe(
      first(),
      switchMap(() => this.selection$.pipe(
        withLatestFrom(this.screen$),
        map(([selection, screen]) => {
          let { left, top } = selection;
          const padding = screen === PebScreen.Desktop
            ? (pebScreenDocumentWidthList[screen] - pebScreenContentWidthList[screen]) / 2
            : 0;

          left = left - padding;

          /***
           * This code is needed to height the missing top error. If the error does not occur, delete after 05/15/2022
           */
           if (top === undefined) {
            try {
              throw new Error('Missing top');
            } catch (e) {
              this.apmService.apm.captureError(
                `top must not be undefined:\n ${JSON.stringify({ selection })}`,
              );
            }

            return;
          };

          this.positionForm.setValue({ x: left, y: top });
          this.positionForm.markAsPristine();
          this.positionForm.markAsUntouched();
          this.previousValue = { x: left, y: top };

          return { left, top };
        }),
        switchMap(() => this.positionForm.valueChanges),
        filter(() => this.positionForm.dirty),
        tap(() => {
          this.positionForm.markAsPristine();
        }),
        switchMap(value => this.positionFormService.setPosition(value)),
        tap((valid) => {

          if (valid) {
            this.previousValue = this.positionForm.value;
          } else {
            setTimeout(() => {
              this.positionForm.patchValue(this.previousValue, { emitEvent: false });
            })
          }

          if (this.positionForm.touched) {
            this.positionForm.markAsUntouched();
          }
        }),
      )),
      switchMap(() => this.selectedElements$.pipe(
        tap((elements) => {
          const abstractElements = elements.map((elementDef) => this.tree.find(elementDef.id));
          const controls = this.controlsService.createDefaultControlsSet(abstractElements);
          this.radiusService.renderRadius(controls);
          this.controlsService.renderControls(controls);
        }),
      )),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
