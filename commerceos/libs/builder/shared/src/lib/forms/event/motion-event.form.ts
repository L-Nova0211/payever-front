import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { PebEditorSlot } from '@pe/builder-abstract';
import { PebEditorAccessorService } from '@pe/builder-services';

import { PebMotionEventDetailForm } from './detail/motion-event-detail.form';

@Component({
  selector: 'peb-motion-event-form',
  templateUrl: './motion-event.form.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    './motion-event.form.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})

export class PebMotionEventForm implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() title: string;
  @Input() effectType: string;
  @Input() effectTypes: any[];

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
      tap((type) => {
        this.editor.backTo('main');
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  getEventType(): string {
    return this.formGroup.get(this.effectType).value && this.formGroup.get(this.effectType).value.name
      ? this.formGroup.get(this.effectType).value.name
      : this.formGroup.get(this.effectType).value;
  }

  showDetail() {
    const title = this.title.toLowerCase();
    this.editor.detail = { back: 'Motion', title: title.charAt(0).toUpperCase() + title.slice(1) };
    const sidebarCmpRef = this.editor.insertToSlot(PebMotionEventDetailForm, PebEditorSlot.sidebarDetail);
    sidebarCmpRef.instance.formGroup = this.formGroup;
    sidebarCmpRef.instance.effectType = this.effectType;
    sidebarCmpRef.instance.effectTypes = this.effectTypes;
  }
}
