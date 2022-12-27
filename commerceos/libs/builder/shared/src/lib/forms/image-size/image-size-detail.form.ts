import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ImageSize, ImageSizes } from '@pe/builder-old';


@Component({
  selector: 'peb-image-size-detail-form',
  templateUrl: './image-size-detail.form.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    './image-size-detail.form.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorImageSizeDetailForm {

  @Input() formGroup: FormGroup;

  readonly options = ImageSizes.reduce(
    (acc, size) => {
      if (size.value !== ImageSize.Initial && size.value !== ImageSize.Stretch) {
        acc.push({
          name: size.name,
          value: size.value,
        });
      }

      return acc;
    },
    [],
  );

  readonly ImageSize: typeof ImageSize = ImageSize;

  constructor() { }

  setImageSizeValue(value: string): void {
    this.formGroup.get('size').setValue(value);
  }
}
