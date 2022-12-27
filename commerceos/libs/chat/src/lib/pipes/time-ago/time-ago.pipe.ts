import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
})
export class PeTimeAgoPipe implements PipeTransform {
  transform(time: string): string {
    if (!time) {
      return '';
    }

    const currentDate: any = new Date();
    const lastTime: any = new Date(time);
    const timeAgo = Math.round((currentDate - lastTime) / 60000);
    let response = timeAgo.toString();

    if (timeAgo < 60) {
      response += ' min';
    } else if ((timeAgo / 60) === 1) {
      response = '1 hour';
    } else if ((timeAgo / 60) < 24) {
      response = (timeAgo % 60) > 0 ? (timeAgo / 60) + ' hours' + (timeAgo % 60) + 'min' : (timeAgo / 60) + ' hours';
    } else if ((timeAgo / 60 / 24) === 1) {
      response = '1 day';
    } else if ((timeAgo / 60 / 24) > 1) {
      response = Math.round(timeAgo / 60 / 24) + ' days';
    }

    return response;
  }
}
