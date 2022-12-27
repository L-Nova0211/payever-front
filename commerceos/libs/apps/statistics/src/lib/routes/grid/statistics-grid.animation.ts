import { animate, state, style, transition, trigger } from '@angular/animations';

const sidebarWidth = 336;

export enum GridAnimationStates {
  Default = 'default',
  Expanded = 'expanded'
}

export enum GridAnimationProgress {
  Start,
  Done
}

export const GridExpandAnimation = trigger('gridAnimation', [
  state(
    'default',
    style({
      width: `calc(100% - ${sidebarWidth}px)`,
      marginLeft: `${sidebarWidth}px`,
    }),
  ),
  state(
    'expanded',
    style({
      width: '100%',
      marginLeft: '0',
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
        style({ marginLeft: -sidebarWidth }),
        animate('.3s linear',
                style({ marginLeft: 0 })),
      ],
    ),
    transition(
      ':leave',
      [
        style({ marginLeft: 0 }),
        animate('.3s linear',
                style({ marginLeft: -sidebarWidth })),
      ],
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
