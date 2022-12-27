import { animate, AnimationMetadata, state, style, transition, trigger } from '@angular/animations';

export const ProductDetailsAnimations: AnimationMetadata[] = [
  trigger('overlayState', [
    state(
      'default',
      style({
        transform: 'translateY(100%)',
      }),
    ),
    state(
      'open',
      style({
        transform: 'translateY(0%)',
      }),
    ),
    transition(
      'default <=> open',
      animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)'),
    ),
  ]),
];
