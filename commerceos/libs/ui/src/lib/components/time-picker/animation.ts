import { animate, state, style, transition, trigger } from '@angular/animations';

export const timeMove = trigger('timeMove', [
  state('*', style({ transform: 'translateY({{offset}}px)' }), { params : { offset: 7 } }),
  transition('* <=> *', [
    animate('0.4s', style({ transform: 'translateY({{offset}}px)' })),
  ]),
]);
