import { ChangeDetectionStrategy, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Select } from '@ngxs/store';
import isEqual from 'lodash/isEqual';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebElementsService } from '@pe/builder-controls';
import { PebElementDef, PebElementType } from '@pe/builder-core';
import { PebAbstractElement, PebRTree } from '@pe/builder-renderer';
import { PebElementSelectionState } from '@pe/builder-state';
import { PeDestroyService } from '@pe/common';

import { PebGridLayoutFormService } from './grid-layout-form.service';


@Component({
  selector: 'peb-grid-layout-form',
  templateUrl: './grid-layout-form.component.html',
  styleUrls: ['./grid-layout-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebGridLayoutForm implements OnInit {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;

  gridLayoutForm = this.formBuilder.group({ colCount: 1, rowCount: 1 });

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly elementsService: PebElementsService,
    private readonly formBuilder: FormBuilder,
    private readonly gridLayoutFormService: PebGridLayoutFormService,
    private readonly ngZone: NgZone,
    private readonly tree: PebRTree<PebAbstractElement>,
  ) {
  }

  ngOnInit(): void {
    this.ngZone.onStable.pipe(
      first(),
      switchMap(() => this.selectedElements$),
      filter(elements => elements.length === 1 && elements[0].type === PebElementType.Grid),
      tap((selectedElements) => {
        selectedElements.forEach((element) => {
          const { colCount, rowCount } = this.tree.find(element.id).data;

          this.gridLayoutForm.setValue({ colCount, rowCount });
        });
      }),
      switchMap(() => this.gridLayoutForm.valueChanges),
      debounceTime(100),
      filter(() => this.gridLayoutForm.dirty),
      map(value => Object.entries(value).reduce((acc, [key, value]) =>
        this.gridLayoutForm.get(key).dirty ? { ...acc, [key]: value } : acc, {})),
      tap(() => {
        this.gridLayoutForm.markAsPristine();
      }),
      distinctUntilChanged((a, b) => isEqual(a, b)),
      switchMap((value) => this.gridLayoutFormService.setGridLayout(value)),
      tap(() => {
        if (this.gridLayoutForm.touched) {
          this.gridLayoutForm.markAsUntouched();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe()
  }
}
