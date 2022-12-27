import { animate, state, style, transition, trigger } from '@angular/animations';

export const showLiveMessage = trigger('showLiveMessage', [
  state('open', style({
    transform: 'translateY(0)',
    opacity: 1,
  })),
  state('closed', style({
    transform: 'translateY(10%)',
    opacity: 0,
  })),
  transition('* => *', [
    animate('0.2s'),
  ]),
]);
