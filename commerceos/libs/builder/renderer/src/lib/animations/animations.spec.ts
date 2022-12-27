import { animate, keyframes, style, transition } from '@angular/animations';

import {
  PebBuildInAnimationType,
  PebBuildOutAnimationType,
  PebMotionDirection,
  PebMotionType,
} from '@pe/builder-core';

import {
  createAnimation,
  createBuildInAnimation,
  createBuildOutAnimation,
  createRestoreAnimation,
  createScaleOutAnimation,
} from './animations';

describe('Animations', () => {

  it('should create animation', () => {

    const animation = {
      type: null,
      duration: 2,
      delay: .5,
      direction: PebMotionDirection.LeftToRight,
    };
    const hostStyles = {
      opacity: null,
      filter: null,
      transform: null,
    };

    /**
     * animation.type is null
     */
    expect(createAnimation(animation as any, PebMotionType.Action, hostStyles)).toEqual([]);

    /**
     * animation.type is PebBuildInAnimationType.Dissolve
     * hostStyles.opacity is null
     */
    animation.type = PebBuildInAnimationType.Dissolve;
    expect(createAnimation(animation as any, PebMotionType.Action, hostStyles)).toEqual([
      style({ opacity: 0 }),
      animate(`${animation.duration}s ${animation.delay}s`, style({ opacity: 1 })),
    ]);

    /**
     * hostStyle.opacity is set
     */
    hostStyles.opacity = .75;
    expect(createAnimation(animation as any, PebMotionType.Action, hostStyles)).toEqual([
      style({ opacity: 0 }),
      animate(`${animation.duration}s ${animation.delay}s`, style({ opacity: hostStyles.opacity })),
    ]);

    /**
     * animation.type is PebBuildOutAnimationType.Dissolve
     */
    animation.type = PebBuildOutAnimationType.Dissolve;
    expect(createAnimation(animation as any, PebMotionType.Action, hostStyles)).toEqual([
      style({ opacity: '*' }),
      animate(`${animation.duration}s ${animation.delay}s`, style({ opacity: 0 })),
    ]);

    /**
     * animation.type is PebBuildOutAnimationType.Disappear
     */
    animation.type = PebBuildOutAnimationType.Disappear;
    expect(createAnimation(animation as any, PebMotionType.Action, hostStyles)).toEqual([
      style({ opacity: '*' }),
      animate(`${animation.duration}s ${animation.delay}s`, style({ opacity: 0 })),
    ]);

    /**
     * animation.type is PebBuildInAnimationType.Blur
     * hostStyles.opacity & filter are null
     */
    animation.type = PebBuildInAnimationType.Blur;
    hostStyles.opacity = null;
    expect(createAnimation(animation as any, PebMotionType.Action, hostStyles)).toEqual([
      style({ filter: 'blur(2.0rem)', opacity: 1 }),
      animate(`${animation.duration}s ${animation.delay}s`, style({ filter: 'none' })),
    ]);

    /**
     * hostStyles.opacity & filter are set
     */
    hostStyles.opacity = .66;
    hostStyles.filter = 'blur(5px)';
    expect(createAnimation(animation as any, PebMotionType.Action, hostStyles)).toEqual([
      style({ filter: 'blur(2.0rem)', opacity: hostStyles.opacity }),
      animate(`${animation.duration}s ${animation.delay}s`, style({ filter: hostStyles.filter })),
    ]);

    /**
     * animation.type is PebBuildOutAnimationType.Blur
     */
    animation.type = PebBuildOutAnimationType.Blur;
    expect(createAnimation(animation as any, PebMotionType.Action, hostStyles)).toEqual([
      style({ filter: '*' }),
      animate(`${animation.duration}s ${animation.delay}s`, style({ filter: 'blur(2.0rem)' })),
      style({ opacity: 0 }),
    ]);

    /**
     * animation.type is PebBuildInAnimationType.Scale
     * hostStyles.transform is null
     */
    animation.type = PebBuildInAnimationType.Scale;
    expect(createAnimation(animation as any, PebMotionType.Action, hostStyles)).toEqual([
      style({ transform: 'scale(0)' }),
      animate(`${animation.duration}s ${animation.delay}s`, style({ transform: 'scale(1)' })),
      style({ transform: '*' }),
    ]);

    /**
     * hostStyles.transform is set
     */
    hostStyles.transform = 'scale(0.5)';
    expect(createAnimation(animation as any, PebMotionType.Action, hostStyles)).toEqual([
      style({ transform: 'scale(0)' }),
      animate(`${animation.duration}s ${animation.delay}s`, style({ transform: hostStyles.transform })),
      style({ transform: '*' }),
    ]);

    /**
     * animation.type is PebBuildInAnimationType.MoveIn
     * animation.direction is PebMotionDirection.LeftToRight
     * hostStyles.transform is null
     */
    animation.type = PebBuildInAnimationType.MoveIn;
    hostStyles.transform = null;
    expect(createAnimation(animation as any, PebMotionType.Action, hostStyles)).toEqual([
      style({ transform: 'translate(-100vw, 0)' }),
      animate(`${animation.duration}s ${animation.delay}s`, style({ transform: 'none' })),
    ]);

    /**
     * hostStyles.transform is set
     * animation.direction is PebMotionDirection.TopToBottom
     */
    hostStyles.transform = 'scale(2)';
    animation.direction = PebMotionDirection.TopToBottom;
    expect(createAnimation(animation as any, PebMotionType.Action, hostStyles)).toEqual([
      style({ transform: 'translate(0, -100vh)' }),
      animate(`${animation.duration}s ${animation.delay}s`, style({ transform: hostStyles.transform })),
    ]);

    /**
     * animation.type is PebBuildOutAnimationType.MoveOut
     * animation.direction is PebMotionDirection.RightToLeft
     */
    animation.type = PebBuildOutAnimationType.MoveOut;
    animation.direction = PebMotionDirection.RightToLeft;
    expect(createAnimation(animation as any, PebMotionType.Action, hostStyles)).toEqual([
      style({ transform: '*' }),
      animate(`${animation.duration}s ${animation.delay}s`, style({ transform: 'translate(100vw, 0)' })),
    ]);

    /**
     * animation.direction is PebMotionDirection.BottomToTop
     */
    animation.direction = PebMotionDirection.BottomToTop;
    expect(createAnimation(animation as any, PebMotionType.Action, hostStyles)).toEqual([
      style({ transform: '*' }),
      animate(`${animation.duration}s ${animation.delay}s`, style({ transform: 'translate(0, 100vh)' })),
    ]);

    /**
     * animation.type is PebBuildInAnimationType.Pop
     * hostStyles.transform & opacity are null
     */
    animation.type = PebBuildInAnimationType.Pop;
    hostStyles.transform = null;
    hostStyles.opacity = null;
    expect(createAnimation(animation as any, PebMotionType.Action, hostStyles)).toEqual([
      style({ transform: 'scale(0)', opacity: 0 }),
      animate(`${animation.duration}s ${animation.delay}s`, keyframes([
        style({ transform: 'scale(0)', opacity: 0, offset: 0 }),
        style({ transform: 'scale(1.25)', opacity: 0.5, offset: 0.45 }),
        style({ transform: 'scale(0.9)', opacity: 1, offset: 0.7 }),
        style({ transform: 'scale(1)', opacity: 1, offset: 1 }),
      ])),
    ]);

    /**
     * hostStyles.transform & opacity are set
     */
    hostStyles.transform = 'rotate(120deg)';
    hostStyles.opacity = .13;
    expect(createAnimation(animation as any, PebMotionType.Action, hostStyles)).toEqual([
      style({ transform: 'scale(0)', opacity: 0 }),
      animate(`${animation.duration}s ${animation.delay}s`, keyframes([
        style({ transform: 'scale(0)', opacity: 0, offset: 0 }),
        style({ transform: 'scale(1.25)', opacity: 0.5, offset: 0.45 }),
        style({ transform: 'scale(0.9)', opacity: 1, offset: 0.7 }),
        style({ transform: hostStyles.transform, opacity: hostStyles.opacity, offset: 1 }),
      ])),
    ]);

  });

  it('should create scale out animation', () => {

    const animation = {
      duration: 2,
      delay: 0,
    };

    expect(createScaleOutAnimation(animation as any)).toEqual([
      style({ transform: 'scale(1)' }),
      animate(`${animation.duration}s ${animation.delay}s`, style({ transform: 'scale(0)' })),
    ]);

  });

  it('should create build out animation', () => {

    const meta = [style({ transform: 'scale(1)' })];

    expect(createBuildOutAnimation(meta)).toEqual([transition(':leave', meta)]);

  });

  it('should create build in animation', () => {

    const meta = [style({ transform: 'scale(1)' })];

    expect(createBuildInAnimation(meta)).toEqual([transition(':enter', meta)]);

  });

  it('should create restore animation', () => {

    const animation = { duration: 1 };

    expect(createRestoreAnimation(animation as any)).toEqual([
      animate(`0s ${animation.duration}s`, style({ transform: '*', opacity: '*', filter: '*' })),
    ]);

  });

});
