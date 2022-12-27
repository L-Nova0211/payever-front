import { animate, state, style, transition, trigger } from '@angular/animations';

export enum SidebarAnimationStates {
  Default = 'default',
  Expanded = 'expanded',
}

export enum SidebarAnimationProgress {
  Start,
  Done,
}

export const GridExpandAnimation = trigger('gridAnimationInvoice', [
  state(
    'default',
    style({
      width: `100%`,
      marginLeft: `{{sidebarWidth}}px`,
    }), { params : { sidebarWidth: 378 } },
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

export const SidebarAnimation = trigger(
  'sidebarAnimation',
  [
    transition(
      ':enter',
      [
        style({ marginLeft: '-{{sidebarWidth}}px' }),
        animate('.3s linear',
          style({ marginLeft: 0 })),
      ], { params : { sidebarWidth: 378 } },
    ),
    transition(
      ':leave',
      [
        style({ marginLeft: 0 }),
        animate('.3s linear',
          style({ marginLeft: '-{{sidebarWidth}}px' })),
      ], { params : { sidebarWidth: 378 } },
    ),
  ],
);

export const MobileSidebarAnimation = trigger(
  'mobileSidebarAnimation',
  [
    transition(
      ':enter',
      [
        style({ margin: 0, opacity: 0 }),
        animate('.3s linear',
          style({ opacity: 1 })),
      ],
    ),
    transition(
      ':leave',
      [
        style({ margin: 0, opacity: 1 }),
        animate('.3s linear',
          style({ opacity: 0 })),
      ],
    ),
  ],
);

export const newSidebarAnimation = trigger('slideInOut', [
  state('in', style({
    transform: 'translate3d(0,0,0)',
  })),
  state('out', style({
    transform: 'translate3d(-100%, 0, 0)',
  })),
  transition('in => out', animate('400ms ease-in-out')),
  transition('out => in', animate('400ms ease-in-out')),
])
