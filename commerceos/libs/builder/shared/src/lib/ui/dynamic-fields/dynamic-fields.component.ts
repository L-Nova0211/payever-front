import { AfterViewInit, Component, ContentChildren, EventEmitter, Output, QueryList } from '@angular/core';
import { merge } from 'rxjs';
import { startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { PebEditorDynamicFieldComponent } from './dynamic-field.component';


@Component({
  selector: 'peb-dynamic-fields',
  templateUrl: './dynamic-fields.component.html',
  styleUrls: ['./dynamic-fields.component.scss'],
  providers: [PeDestroyService],
})
export class PebEditorDynamicFieldsComponent implements AfterViewInit {
  @Output() add = new EventEmitter<number>();
  @Output() remove = new EventEmitter<number>();

  @ContentChildren(PebEditorDynamicFieldComponent) fields: QueryList<PebEditorDynamicFieldComponent>;

  selectedFieldIndex: number = null;

  constructor(private readonly destroy$: PeDestroyService) {
  }

  ngAfterViewInit() {
    this.fields.changes.pipe(
      startWith(this.fields),
      switchMap((fields: QueryList<PebEditorDynamicFieldComponent>) => merge(
        ...fields.map(f => f.selected.pipe(
          tap(() => this.selectField(f))),
        )),
      ),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  selectField(field: PebEditorDynamicFieldComponent): void {
    const nextIndex = this.fields.toArray().findIndex(f => f === field);

    if (nextIndex === this.selectedFieldIndex) {
      this.reset();

      return;
    }

    this.reset();
    field.active = true;
    this.selectedFieldIndex = this.fields.toArray().findIndex(f => f === field);
  }

  onAdd() {
    this.add.emit(this.selectedFieldIndex);
  }

  onRemove() {
    this.remove.emit(this.selectedFieldIndex);
    this.reset();
  }

  private reset() {
    this.fields.toArray().forEach((f: PebEditorDynamicFieldComponent) => f.active = false);
    this.selectedFieldIndex = null;
  }
}
