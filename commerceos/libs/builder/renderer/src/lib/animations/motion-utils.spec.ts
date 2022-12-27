import { fakeAsync, tick } from '@angular/core/testing';
import { pick } from 'lodash';
import { of } from 'rxjs';
import { isEmpty } from 'rxjs/operators';

import {
  PebActionAnimationType,
  PebBuildInAnimationType,
  PebBuildOutAnimationType,
  PebIntegrationInteractionAction,
  PebInteractionType,
  PebMotionDirection,
  PebMotionEvent,
  PebMotionEventType,
  PebMotionType,
} from '@pe/builder-core';

import {
  getPebAnimationTypeConfig,
  getPebMotionDirectionConfig,
  getPebMotionEventConfig,
  getPebMotionEventTypeConfig,
  getPebMotionTypeConfig,
  PebMotionEventTypeConfig,
} from './motion-utils';

describe('Utils:Motion', () => {

  it('should get animation type config', () => {

    expect(getPebAnimationTypeConfig('test' as any)).toBeNull();
    expect(getPebAnimationTypeConfig(PebActionAnimationType.Dissolve)).toEqual({
      title: 'Dissolve',
      code: PebActionAnimationType.Dissolve,
      animationStatesMatcher: {
        in: { motionType: PebMotionType.BuildIn, animation: { type: PebBuildInAnimationType.Dissolve } },
        out: { motionType: PebMotionType.BuildOut, animation: { type: PebBuildOutAnimationType.Dissolve } },
      },
    });

  });

  it('should get motion type config', () => {

    expect(getPebMotionTypeConfig('test' as any)).toBeNull();
    expect(getPebMotionTypeConfig(PebMotionType.BuildOut)).toEqual({
      title: 'Build Out',
      code: PebMotionType.BuildOut,
    });

  });

  it('should get motion event config', () => {

    expect(getPebMotionEventConfig('test' as any)).toBeNull();
    expect(getPebMotionEventConfig(PebMotionEvent.OnClick)).toEqual({
      title: 'On click',
      code: PebMotionEvent.OnClick,
    });

  });

  it('should get motion direction config', () => {

    expect(getPebMotionDirectionConfig('test' as any)).toBeNull();
    expect(getPebMotionDirectionConfig(PebMotionDirection.BottomToTop)).toEqual({
      title: 'Bottom To Top',
      code: PebMotionDirection.BottomToTop,
    });

  });

  it('should get motion event type config', fakeAsync(() => {

    const elem = {
      element: {
        data: null,
      },
      rendererContext: {
        '@cart': null,
      },
      interactionSubscription: jasmine.createSpy('interactionSubscription').and.returnValue(of(null)),
    };
    let config: PebMotionEventTypeConfig;

    expect(getPebMotionEventTypeConfig('test' as any)).toBeNull();

    /**
     * argument type is PebMotionEventType.BasketFill
     */
    config = getPebMotionEventTypeConfig(PebMotionEventType.BasketFill);
    expect(pick(config, ['title', 'code', 'animationStates'])).toEqual({
      title: 'Basket fill',
      code: PebMotionEventType.BasketFill,
      animationStates: ['out', 'in'],
    });

    /**
     * elem.rendererContext['@cart'] is null
     */
    config.getAnimationState(elem as any).subscribe(state => expect(state).toEqual('out')).unsubscribe();

    /**
     * elem.rendererContext['@cart'].data is null
     */
    elem.rendererContext['@cart'] = { data: null };
    config.getAnimationState(elem as any).subscribe(state => expect(state).toEqual('out')).unsubscribe();

    /**
     * elem.rendererContext['@cart'].data.length is 3
     */
    elem.rendererContext['@cart'].data = { length: 3 };
    config.getAnimationState(elem as any).subscribe(state => expect(state).toEqual('in')).unsubscribe();

    /**
     * argument type is PebMotionEventType.Snackbar
     */
    config = getPebMotionEventTypeConfig(PebMotionEventType.Snackbar);
    expect(pick(config, ['title', 'code', 'animationStates'])).toEqual({
      title: 'Snackbar',
      code: PebMotionEventType.Snackbar,
      animationStates: ['out', 'in'],
    });

    /**
     * elem.element.data is null
     */
    config.getAnimationState(elem as any)
      .pipe(isEmpty())
      .subscribe(empty => expect(empty).toBe(true))
      .unsubscribe();
    expect(elem.interactionSubscription).not.toHaveBeenCalled();

    /**
     * elem.element.data.interaction
     */
    const result = [];
    elem.element.data = {
      interaction: {
        interactionType: PebInteractionType.CartClick,
        interactionAction: PebIntegrationInteractionAction.Subscribe,
      },
    };
    config.getAnimationState(elem as any)
      .subscribe(res => result.push(res));
    expect(elem.interactionSubscription).toHaveBeenCalledWith(PebInteractionType.CartClick);

    tick(2000);

    expect(result).toEqual(['in', 'out']);

  }));

});
