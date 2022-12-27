import { Component, Input } from '@angular/core';
import { range } from 'lodash-es';

import { AppThemeEnum } from '@pe/common';

@Component({
  selector: 'pe-folders-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
})

export class PeFolderSkeletonComponent {

  @Input() theme: AppThemeEnum = AppThemeEnum.default;

  get folders(): number {
    return range(3);
  }

  get containers(): number {
    return range(3);
  }

}
