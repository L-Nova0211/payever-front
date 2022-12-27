import { Pipe, PipeTransform } from '@angular/core';

import { PeMediaUrlTypeEnum } from '../enums';
import { PeMediaService } from '../services';

@Pipe({
  name: 'mediaUrl',
})
export class PeMediaUrlPipe implements PipeTransform {
  constructor(
    private peMediaService: PeMediaService
    ) { }

  transform(blob: string, container: string, type: PeMediaUrlTypeEnum.Thumbnail, size: string = null): string {
    return this.peMediaService.getMediaUrl(blob, container, type, size);
  }
}
