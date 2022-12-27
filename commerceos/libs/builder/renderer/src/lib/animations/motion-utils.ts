import { EMPTY, Observable, of, timer } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import {
  PebActionAnimationType,
  PebAnimation,
  PebAnimationType,
  PebBuildInAnimationType,
  PebBuildOutAnimationType,
  PebIntegrationInteraction,
  PebIntegrationInteractionAction,
  PebMotionDirection,
  PebMotionEvent,
  PebMotionEventType,
  PebMotionType,
} from '@pe/builder-core';

import { PebAbstractElement } from '../elements/_abstract/abstract.element';

export interface PebAnimationTypeConfig {
  title: string;
  code: PebAnimationType;
  oppositeType?: PebAnimationType;
  hasDirection?: boolean;
  animationStatesMatcher?: { [state: string]: { motionType: PebMotionType, animation: Partial<PebAnimation> } };
}

export interface PebMotionTypeConfig {
  title: string;
  code: PebMotionType;
}

export interface PebMotionEventConfig {
  title: string;
  code: PebMotionEvent;
}

export interface PebMotionDirectionConfig {
  title: string;
  code: PebMotionDirection;
}

export interface PebMotionEventTypeConfig {
  title: string;
  code: PebMotionEventType;
  animationStates?: string[];
  getAnimationState?: (el: PebAbstractElement) => Observable<string>;
}

const pebAnimationsConfig: { [type: string]: PebAnimationTypeConfig } = {
  [PebBuildInAnimationType.None]: {
    title: 'None',
    code: PebBuildInAnimationType.None,
  },
  [PebBuildInAnimationType.Blur]: {
    title: 'Blur in',
    code: PebBuildInAnimationType.Blur,
    oppositeType: PebBuildOutAnimationType.Blur,
  },
  [PebBuildInAnimationType.Pop]: {
    title: 'Pop in',
    code: PebBuildInAnimationType.Pop,
  },
  [PebBuildInAnimationType.Drift]: {
    title: 'Drift in',
    code: PebBuildInAnimationType.Drift,
    hasDirection: true,
  },
  [PebBuildInAnimationType.Scale]: {
    title: 'Scale in',
    code: PebBuildInAnimationType.Scale,
    // oppositeType: PebBuildOutAnimationType,
  },
  [PebBuildInAnimationType.Dissolve]: {
    title: 'Dissolve in',
    code: PebBuildInAnimationType.Dissolve,
    oppositeType: PebBuildOutAnimationType.Dissolve,
  },
  [PebBuildInAnimationType.MoveIn]: {
    title: 'Move in',
    code: PebBuildInAnimationType.MoveIn,
    hasDirection: true,
    oppositeType: PebBuildOutAnimationType.MoveOut,
  },
  // [PebBuildInAnimationType.Typewriter]: {
  //   title: 'Typewriter',
  //   code: PebBuildInAnimationType.Typewriter,
  // },

  [PebBuildOutAnimationType.None]: {
    title: 'None',
    code: PebBuildOutAnimationType.None,
  },
  [PebBuildOutAnimationType.Blur]: {
    title: 'Blur out',
    code: PebBuildOutAnimationType.Blur,
    oppositeType: PebBuildInAnimationType.Blur,
  },
  [PebBuildOutAnimationType.Dissolve]: {
    title: 'Dissolve out',
    code: PebBuildOutAnimationType.Dissolve,
    oppositeType: PebBuildInAnimationType.Dissolve,
  },
  [PebBuildOutAnimationType.MoveOut]: {
    title: 'Move out',
    hasDirection: true,
    code: PebBuildOutAnimationType.MoveOut,
    oppositeType: PebBuildInAnimationType.MoveIn,
  },
  [PebBuildOutAnimationType.Disappear]: {
    title: 'Disappear',
    code: PebBuildOutAnimationType.Disappear,
  },

  [PebActionAnimationType.Move]: {
    title: 'Move',
    code: PebActionAnimationType.Move,
    hasDirection: true,
    animationStatesMatcher: {
      in: { motionType: PebMotionType.BuildIn, animation: { type: PebBuildInAnimationType.MoveIn } },
      out: { motionType: PebMotionType.BuildOut, animation: { type: PebBuildOutAnimationType.MoveOut } },
    },
  },
  [PebActionAnimationType.Blur]: {
    title: 'Blur',
    code: PebActionAnimationType.Blur,
    animationStatesMatcher: {
      in: { motionType: PebMotionType.BuildIn, animation: { type: PebBuildInAnimationType.Blur } },
      out: { motionType: PebMotionType.BuildOut, animation: { type: PebBuildOutAnimationType.Blur } },
    },
  },
  [PebActionAnimationType.Dissolve]: {
    title: 'Dissolve',
    code: PebActionAnimationType.Dissolve,
    animationStatesMatcher: {
      in: { motionType: PebMotionType.BuildIn, animation: { type: PebBuildInAnimationType.Dissolve } },
      out: { motionType: PebMotionType.BuildOut, animation: { type: PebBuildOutAnimationType.Dissolve } },
    },
  },
  [PebActionAnimationType.None]: {
    title: 'None',
    code: PebActionAnimationType.None,
  },
};

export const getPebAnimationTypeConfig: (animationType: PebAnimationType) => PebAnimationTypeConfig =
  t => pebAnimationsConfig[t] ?? null;

const pebMotionTypesConfig: { [type: string]: PebMotionTypeConfig } = {
  [PebMotionType.BuildIn]: {
    title: 'Build In',
    code: PebMotionType.BuildIn,
  },
  [PebMotionType.Action]: {
    title: 'Action',
    code: PebMotionType.Action,
  },
  [PebMotionType.BuildOut]: {
    title: 'Build Out',
    code: PebMotionType.BuildOut,
  },
};

export const getPebMotionTypeConfig = (t: PebMotionType) => pebMotionTypesConfig[t] ?? null;

const pebMotionEventsConfig: { [type: string]: PebMotionEventConfig } = {
  [PebMotionEvent.None]: {
    title: 'None',
    code: PebMotionEvent.None,
  },
  [PebMotionEvent.OnLoad]: {
    title: 'On Load',
    code: PebMotionEvent.OnLoad,
  },
  [PebMotionEvent.OnDataPoint]: {
    title: 'On Data Point',
    code: PebMotionEvent.OnDataPoint,
  },
  [PebMotionEvent.After]: {
    title: 'After',
    code: PebMotionEvent.After,
  },
  [PebMotionEvent.OnClick]: {
    title: 'On click',
    code: PebMotionEvent.OnClick,
  },
};

export const getPebMotionEventConfig = (t: PebMotionEvent) => pebMotionEventsConfig[t] ?? null;

const pebMotionDirectionsConfig: { [type: string]: PebMotionDirectionConfig } = {
  [PebMotionDirection.LeftToRight]: {
    title: 'Left To Right',
    code: PebMotionDirection.LeftToRight,
  },
  [PebMotionDirection.RightToLeft]: {
    title: 'Right To Left',
    code: PebMotionDirection.RightToLeft,
  },
  [PebMotionDirection.TopToBottom]: {
    title: 'Top To Bottom',
    code: PebMotionDirection.TopToBottom,
  },
  [PebMotionDirection.BottomToTop]: {
    title: 'Bottom To Top',
    code: PebMotionDirection.BottomToTop,
  },
};

export const getPebMotionDirectionConfig = (t: PebMotionDirection) => pebMotionDirectionsConfig[t] ?? null;

const pebMotionEventTypesConfig: { [type: string]: PebMotionEventTypeConfig } = {
  [PebMotionEventType.BasketFill]: {
    title: 'Basket fill',
    code: PebMotionEventType.BasketFill,
    animationStates: ['out', 'in'],
    getAnimationState: (el: PebAbstractElement) => {
      return of(el.rendererContext['@cart']?.data?.length ? 'in' : 'out');
    },
  },
  [PebMotionEventType.Snackbar]: {
    title: 'Snackbar',
    code: PebMotionEventType.Snackbar,
    animationStates: ['out', 'in'],
    getAnimationState: (el: PebAbstractElement) => {
      const interaction: PebIntegrationInteraction = el.element.data?.interaction;
      if (interaction?.interactionAction === PebIntegrationInteractionAction.Subscribe) {
        const interactionType = interaction.interactionType;
        const states = ['in', 'out'];

        return el.interactionSubscription(interactionType).pipe(
          switchMap(() => {
            return timer(0, 2000).pipe(
              take(2),
              map(i => states[i]),
            );
          }),
        );
      }

      return EMPTY;
    },
  },
};

export const getPebMotionEventTypeConfig = (t: PebMotionEventType) => pebMotionEventTypesConfig[t] ?? null;
