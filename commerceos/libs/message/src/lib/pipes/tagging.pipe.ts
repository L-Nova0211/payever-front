import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tagging',
})
export class TaggingPipe implements PipeTransform {

  transform(username: string): unknown {
    return `@${username}`;
  }

}
