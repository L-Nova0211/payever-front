import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import { ImageSizes } from '@pe/builder-old';
import { PebEditorAccessorService } from '@pe/builder-services';

import { EditorImageSizeDetailForm } from './image-size-detail.form';

@Component({
  selector: 'peb-image-size-form',
  templateUrl: './image-size.form.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    './image-size.form.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorImageSizeForm implements OnInit {

  @Input() formGroup: FormGroup;

  private get editor() {
    return this.editorAccessorService.editorComponent;
  }

  title$: Observable<string>;

  constructor(
    private editorAccessorService: PebEditorAccessorService,
  ) {
  }

  ngOnInit() {
    this.title$ = this.formGroup.get('size').valueChanges.pipe(
      startWith(this.formGroup.get('size').value),
      map(imageSize => ImageSizes.find(is => is.value === imageSize)?.name ?? 'Original Size'),
    );
  }

  openImageSizeForm(): void {
    const cmp = this.editor.insertToSlot(EditorImageSizeDetailForm, PebEditorSlot.sidebarDetail);
    this.editor.detail = { back: 'Back', title: 'Image Size' };
    Object.assign(cmp.instance, {
      formGroup: this.formGroup,
    });
  }
}
