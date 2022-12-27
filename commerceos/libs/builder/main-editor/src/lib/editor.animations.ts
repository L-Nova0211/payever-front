import { animate, state, style, transition, trigger } from '@angular/animations';

export const sidebarsAnimations = trigger('openClose', [
  state('openLeft', style({
    display: 'flex',
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
  })),
  state('closeLeft', style({
    display: 'none',
    opacity: 0.5,
    transform: 'translate3d(-100%, 0, 0)',
  })),
  state('openRight', style({
    display: 'flex',
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
  })),
  state('closeRight', style({
    display: 'none',
    opacity: 0.5,
    transform: 'translate3d(100%, 0, 0)',
  })),
  state('openBottom', style({
    display: 'flex',
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',

  })),
  state('closeBottom', style({
    display: 'none',
    opacity: 0.5,
    transform: 'translate3d(0, 100%, 0)',
  })),
  transition('openLeft => closeLeft', [
    animate('250ms ease-in'),
  ]),
  transition('closeLeft => openLeft', [
    style({
      display: 'flex',
    }),
    animate('250ms ease-out'),
  ]),
  transition('openRight => closeRight', [
    animate('250ms ease-in'),
  ]),
  transition('closeRight => openRight', [
    style({
      display: 'flex',
    }),
    animate('250ms ease-out'),
  ]),
  transition('openBottom => closeBottom', [
    animate('250ms ease-in'),
  ]),
  transition('closeBottom => openBottom', [
    style({
      display: 'flex',
    }),
    animate('250ms ease-out'),
  ]),
]);
