import { Component, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, first, map, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PebSelectionBBox, PebSelectionBBoxState } from '@pe/builder-controls';
import { PebElementDef, PebElementType, PebScreen } from '@pe/builder-core';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';
import { PebElementSelectionState } from '@pe/builder-state';
import { PeDestroyService } from '@pe/common';

import { PebSectionFormService } from './section-form.service';


@Component({
  selector: 'peb-section',
  templateUrl: './section-form.component.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    './section-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebSectionForm {

  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebSelectionBBoxState.boundingBox) selection$!: Observable<PebSelectionBBox>;

  PebScreen = PebScreen;
  previousValue: { height: number };

  sectionForm = this.formBuilder.group({
    default: false,
    name: '',
    sticky: false,
    fullWidth: false,
    height: 1,
  });

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly formBuilder: FormBuilder,
    private readonly sectionFormService: PebSectionFormService,
    private readonly ngZone: NgZone,
    private readonly tree: PebRTree<PebAbstractElement>,
  ) {
    this.ngZone.onStable.pipe(
      first(),
      switchMap(() => this.selection$),
      withLatestFrom(this.selectedElements$),
      filter(([{ height }, elements]) => elements.length === 1 && elements[0].type === PebElementType.Section),
      tap(([{ height }, [element]]) => {
        this.previousValue = { height };
        const section = this.tree.find(element.id);

        const { name, fullWidth } = section.data;
        const { position } = section.styles;

        this.sectionForm.patchValue({
          default: !section.element.meta.deletable,
          sticky: position === 'sticky',
          name,
          fullWidth,
          height,
        });
      }),
      switchMap(() => this.sectionForm.valueChanges),
      filter(() => this.sectionForm.dirty),
      map(value => Object.entries(value).reduce((acc, [key, value]) =>
        this.sectionForm.get(key).dirty ? { ...acc, [key]: value } : acc, {})),
      tap(() => {
        this.sectionForm.markAsPristine();
      }),
      switchMap((value) => {
        return this.sectionFormService.setSection(value)
      }),
      tap((valid) => {
        if (!valid) { // right  now validate only height
          setTimeout(() => {
            this.sectionForm.patchValue(this.previousValue, { emitEvent: false })
          })
        } else {
          this.previousValue = { height: this.sectionForm.get('height').value };
        }
        if (this.sectionForm.touched) {
          this.sectionForm.markAsUntouched();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  changePosition(direction) {
    this.sectionFormService.changePosition(direction).pipe(take(1)).subscribe();
  }

}
