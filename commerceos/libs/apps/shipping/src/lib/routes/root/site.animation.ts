import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export enum SidebarAnimationStates {
  Default = 'default',
  Expanded = 'expanded',
}

export enum SiteAnimationProgress {
  Start,
  Done,
}

export const GridExpandAnimation = trigger('gridAnimation', [
  state(
    'default',
    style({
      width: `calc(100% - {{sidebarWidth}}px)`,
      marginLeft: `{{sidebarWidth}}px`,
    }),
    { params: { sidebarWidth: 378 } },
  ),
  state(
    'expanded',
    style({
      width: '100%',
      marginLeft: '4px',
    }),
  ),
  transition('default <=> expanded', animate('0.3s linear')),
]);

export const SidebarAnimation = trigger('sidebarAnimation', [
  transition(
    ':enter',
    [
      style({ marginLeft: '-{{sidebarWidth}}px' }),
      animate('.3s linear', style({ marginLeft: 0 })),
    ],
    { params: { sidebarWidth: 378 } },
  ),
  transition(
    ':leave',
    [
      style({ marginLeft: 0 }),
      animate('.3s linear', style({ marginLeft: '-{{sidebarWidth}}px' })),
    ],
    { params: { sidebarWidth: 378 } },
  ),
]);

export const MobileSidebarAnimation = trigger('mobileSidebarAnimation', [
  transition(':enter', [
    style({ margin: 0, opacity: 0 }),
    animate('.3s linear', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    style({ margin: 0, opacity: 1 }),
    animate('.3s linear', style({ opacity: 0 })),
  ]),
]);
