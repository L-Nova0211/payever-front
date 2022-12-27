import { animate, keyframes, style, transition, trigger } from '@angular/animations';

export const highlightMessage = trigger('highlightMessage', [
  transition(':increment', [
    animate('2s', keyframes([
      style({ backgroundColor: 'transparent', offset: 0 }),
      style({ backgroundColor: 'rgba(116, 116, 116, 0.1)', offset: 0.5 }),
      style({ backgroundColor: 'transparent', offset: 1 }),
    ])),
  ]),
]);
