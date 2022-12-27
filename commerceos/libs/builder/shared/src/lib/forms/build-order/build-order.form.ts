import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';

import { PebAnimation, PebElementDef } from '@pe/builder-core';
import { PebEditorAccessorService } from '@pe/builder-services';
import { PeDestroyService } from '@pe/common';


@Component({
  selector: 'peb-build-order',
  templateUrl: './build-order.form.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    './build-order.form.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})

export class EditorBuildOrderForm implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() orders: Array<{ elment: PebElementDef, animation: PebAnimation }>;
  @Output() preview = new EventEmitter<void>();

  private get editor() {
    return this.editorAccessorService.editorComponent;
  }

  constructor(
    public cdr: ChangeDetectorRef,
    private readonly destroy$: PeDestroyService,
    private editorAccessorService: PebEditorAccessorService,
  ) {
  }

  ngOnInit() {
    this.formGroup.valueChanges.pipe(
      tap(() => {
        this.editor.backTo('main');
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  getMotionType(): string {
    return this.formGroup.get('type').value && this.formGroup.get('type').value.name
      ? this.formGroup.get('type').value.name
      : this.formGroup.get('type').value;
  }
}
