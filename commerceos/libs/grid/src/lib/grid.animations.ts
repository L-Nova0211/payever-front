import { trigger, transition, style, animate, state } from '@angular/animations';

export const FadeOutAnimation = trigger(
  'fadeOutAnimation',
  [
    transition('* => void', [
      animate(100, style({ opacity: 0 })),
    ]),
  ],
);

export const ShowHideAnimation = trigger(
  'showHideAnimation',
  [
    state('show', style({
      opacity: 1,
    })),
    state('hide', style({
      opacity: 0,
    })),
    transition('show => hide', [
      animate('0s'),
    ]),
    transition('hide => show', [
      animate('.5s'),
    ]),
  ],
);

export const FadeInAnimation = trigger(
  'fadeInAnimation',
  [
    transition('void => *', [
      style({ opacity: 0 }),
      animate(500, style({ opacity: 1 })),
    ]),
    transition('* => void', [
      style({ opacity: 1 }),
      animate(0, style({ opacity: 0 })),
    ]),
  ],
);
