import { animate, AnimationMetadata, keyframes, style, transition } from '@angular/animations';

import {
  PebAnimation,
  PebBuildInAnimationType,
  PebBuildOutAnimationType,
  PebElementStyles,
  PebMotionDirection,
  PebMotionType,
} from '@pe/builder-core';

export function createAnimation(
  animation: PebAnimation,
  motionType: PebMotionType,
  hostStyles: PebElementStyles,
): AnimationMetadata[] {
  switch (animation.type) {
    case PebBuildInAnimationType.Dissolve:
      return createDissolveInAnimation(animation, hostStyles);
    case PebBuildOutAnimationType.Dissolve:
    case PebBuildOutAnimationType.Disappear:
      return createDissolveOutAnimation(animation);
    case PebBuildInAnimationType.Blur:
      return createBlurInAnimation(animation, hostStyles);
    case PebBuildOutAnimationType.Blur:
      return createBlurOutAnimation(animation);
    case PebBuildInAnimationType.Scale:
      return createScaleInAnimation(animation, hostStyles);
    case PebBuildInAnimationType.MoveIn:
      return createMoveInAnimation(animation, hostStyles);
    case PebBuildOutAnimationType.MoveOut:
      return createMoveOutAnimation(animation);
    case PebBuildInAnimationType.Pop:
      return createPopInAnimation(animation, hostStyles);
    default:
      return [];
  }
}

export function createDissolveInAnimation(animation: PebAnimation, hostStyles: PebElementStyles): AnimationMetadata[] {
  return [
    style({ opacity: 0 }),
    animate(`${animation.duration}s ${animation.delay}s`, style({ opacity: hostStyles.opacity ?? 1 })),
  ];
}

export function createDissolveOutAnimation(animation: PebAnimation): AnimationMetadata[] {
  return [
    style({ opacity: '*' }),
    animate(`${animation.duration}s ${animation.delay}s`, style({ opacity: 0 })),
  ];
}

export function createBlurInAnimation(animation: PebAnimation, hostStyles: PebElementStyles): AnimationMetadata[] {
  return [
    style({ filter: 'blur(2.0rem)', opacity: hostStyles.opacity ?? 1 }),
    animate(`${animation.duration}s ${animation.delay}s`, style({ filter: hostStyles.filter ?? 'none' })),
  ];
}

export function createBlurOutAnimation(animation: PebAnimation): AnimationMetadata[] {
  return [
    style({ filter: '*' }),
    animate(`${animation.duration}s ${animation.delay}s`, style({ filter: 'blur(2.0rem)' })),
    style({ opacity: 0 }),
  ];
}

export function createScaleInAnimation(animation: PebAnimation, hostStyles: PebElementStyles): AnimationMetadata[] {
  return [
    style({ transform: 'scale(0)' }),
    animate(`${animation.duration}s ${animation.delay}s`, style({ transform: hostStyles.transform ?? 'scale(1)' })),
    style({ transform: '*' }),
  ];
}

export function createScaleOutAnimation(animation: PebAnimation): AnimationMetadata[] {
  return [
    style({ transform: 'scale(1)' }),
    animate(`${animation.duration}s ${animation.delay}s`, style({ transform: 'scale(0)' })),
  ];
}

function getMoveTransformDirectionValue(direction: PebMotionDirection): string {
  let transform = '*';
  switch (direction) {
    case PebMotionDirection.BottomToTop:
      transform = '0, 100vh';
      break;
    case PebMotionDirection.RightToLeft:
      transform = '100vw, 0';
      break;
    case PebMotionDirection.TopToBottom:
      transform = '0, -100vh';
      break;
    case PebMotionDirection.LeftToRight:
    default:
      transform = '-100vw, 0';
      break;
  }

  return transform;
}

export function createMoveInAnimation(animation: PebAnimation, hostStyles: PebElementStyles): AnimationMetadata[] {
  const transform = getMoveTransformDirectionValue(animation.direction);

  return [
    style({ transform: `translate(${transform})` }),
    animate(`${animation.duration}s ${animation.delay}s`, style({ transform: hostStyles.transform ?? 'none' })),
  ];
}



export function createMoveOutAnimation(animation: PebAnimation): AnimationMetadata[] {
  const transform = getMoveTransformDirectionValue(animation.direction);

  return [
    style({ transform: `*` }),
    animate(`${animation.duration}s ${animation.delay}s`, style({
      transform: `translate(${transform})`,
    })),
  ];
}

export function createPopInAnimation(animation: PebAnimation, hostStyles: PebElementStyles): AnimationMetadata[] {
  return [
    style({ transform: 'scale(0)', opacity: 0 }),
    animate(`${animation.duration}s ${animation.delay}s`, keyframes([
      style({ transform: 'scale(0)', opacity: 0, offset: 0 }),
      style({ transform: 'scale(1.25)', opacity: 0.5, offset: 0.45 }),
      style({ transform: 'scale(0.9)', opacity: 1, offset: 0.7 }),
      style({ transform: hostStyles.transform ?? 'scale(1)', opacity: hostStyles.opacity ?? 1, offset: 1 }),
    ])),
  ];
}

export function createBuildOutAnimation(meta: AnimationMetadata[]): AnimationMetadata[] {
  return [
    transition(':leave', meta),
  ];
}

export function createBuildInAnimation(meta: AnimationMetadata[]): AnimationMetadata[] {
  return [
    transition(':enter', meta),
  ];
}

export function createRestoreAnimation(animation: PebAnimation): AnimationMetadata[] {
  return [
    animate(`0s ${animation.duration}s`, style({ transform: '*', opacity: '*', filter: '*' })),
  ];
}
