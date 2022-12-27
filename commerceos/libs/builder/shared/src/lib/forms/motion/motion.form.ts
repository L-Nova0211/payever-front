import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil, tap } from 'rxjs/operators';

import {
  PebActionAnimationType,
  PebBuildInAnimationType,
  PebBuildOutAnimationType,
  PebMotionType,
} from '@pe/builder-core';
import { PeDestroyService } from '@pe/common';

import { PebEditorSlot } from '@pe/builder-abstract';
import { PebEditorAccessorService } from '@pe/builder-services';

import { PebMotionDetailForm } from './detail/motion-detail.form';

@Component({
  selector: 'peb-motion-form',
  templateUrl: './motion.form.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    './motion.form.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class EditorMotionForm implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() motionType: PebMotionType;

  motionTypes: any[];

  private get editor() {
    return this.editorAccessorService.editorComponent;
  }

  constructor(
    public dialog: MatDialog,
    public cdr: ChangeDetectorRef,
    private readonly destroy$: PeDestroyService,
    private editorAccessorService: PebEditorAccessorService,
  ) {
  }

  ngOnInit() {
    this.formGroup.valueChanges.pipe(
      tap((type) => {
        this.editor.backTo('main');
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    switch (this.motionType) {
      case PebMotionType.Action:
        this.motionTypes = Object.values(PebActionAnimationType);
        break;
      case PebMotionType.BuildOut:
        this.motionTypes = Object.values(PebBuildOutAnimationType);
        break;
      case PebMotionType.BuildIn:
      default:
        this.motionTypes = Object.values(PebBuildInAnimationType);
        break;
    }
  }

  getMotionType(): string {
    return this.formGroup.get('type').value && this.formGroup.get('type').value.name
      ? this.formGroup.get('type').value.name
      : this.formGroup.get('type').value;
  }

  showDetail() {
    this.editor.detail = { back: 'Motion', title: this.motionType };
    const sidebarCmpRef = this.editor.insertToSlot(PebMotionDetailForm, PebEditorSlot.sidebarDetail);
    sidebarCmpRef.instance.formGroup = this.formGroup;
    sidebarCmpRef.instance.motionType = this.motionType;
  }
}
