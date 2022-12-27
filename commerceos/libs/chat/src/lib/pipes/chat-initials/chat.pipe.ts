import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
})
export class PeChatInitialsPipe implements PipeTransform {
  transform(sender: string): string {
    if (!sender) {
      return '';
    }

    const names = sender.split(' ');

    return names.map(n => n.charAt(0)).splice(0, 1).join('').toUpperCase();
  }
}
