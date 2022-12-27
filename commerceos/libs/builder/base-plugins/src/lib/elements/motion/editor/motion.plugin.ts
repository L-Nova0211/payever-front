import { Injectable, Injector } from '@angular/core';
import { merge as lMerge, set as lSet } from 'lodash';
import { concat, iif, merge, Observable, of, Subject } from 'rxjs';
import { filter, finalize, map, mapTo, skip, switchMap, take, takeUntil, withLatestFrom } from 'rxjs/operators';

import {
  PebActionAnimationType,
  PebAnimation,
  PebBuildInAnimationType,
  PebBuildOutAnimationType,
  pebCreateLogger,
  PebEditorState,
  PebEffectTarget,
  PebElementDef,
  PebElementType,
  PebMotion,
  PebMotionDelivery,
  PebMotionDirection,
  PebMotionEvent,
  PebMotionEventType,
  PebMotionTextDelivery,
  PebMotionType,
  PebShopEffect,
} from '@pe/builder-core';
import { PebEditorElement } from '@pe/builder-main-renderer';
import { AfterGlobalInit } from '@pe/builder-old';
import { getPebAnimationTypeConfig, getPebMotionEventTypeConfig } from '@pe/builder-renderer';
import { AbstractEditElementPlugin } from '@pe/builder-shared';

import { PebEditorMotionSidebarComponent } from './motion.sidebar';

const log = pebCreateLogger('editor:plugin:page');

@Injectable()
export class PebEditorMotionPlugin
  extends AbstractEditElementPlugin<PebEditorMotionSidebarComponent>
  implements AfterGlobalInit {

  sidebarComponent = PebEditorMotionSidebarComponent;

  logger = { log };

  state = this.injector.get(PebEditorState);

  constructor(injector: Injector) {
    super(injector);
  }

  afterGlobalInit(): Observable<any> {
    return merge(
      this.selectedElements$.pipe(
        filter(elements => elements.length === 1),
        map(([element]) => element.id),
      ),
      this.renderer.rendered.pipe(
        withLatestFrom(this.editorStore.page$),
        filter(([_, page]) => !!page?.template?.id),
        take(1),
        mapTo(null),
      ),
    ).pipe(
      map(id => this.renderer.getElementComponent(id ?? this.editorStore.page?.template?.id)),
      filter(id => !!id),
      switchMap((elCmp) => {
        this.initMotionForm(elCmp);

        return this.openMotionSidebar(elCmp, elCmp.definition);
      }),
    );
  }

  protected initMotionForm(elementCmp: PebEditorElement) {
    Object.values(PebMotionType).forEach((motionType) => {
      let animation: PebAnimation;
      let noMotion: any;
      let motionEvent: PebMotionEvent = PebMotionEvent.None;
      let motionEventType: PebMotionEventType;
      switch (motionType) {
        case PebMotionType.BuildIn:
          animation = elementCmp.definition.motion?.buildIn;
          noMotion = PebBuildInAnimationType.None;
          motionEvent = PebMotionEvent.OnLoad;
          break;
        case PebMotionType.Action:
          animation = elementCmp.definition.motion?.action;
          noMotion = PebActionAnimationType.None;
          motionEventType = PebMotionEventType.BasketFill;
          break;
        case PebMotionType.BuildOut:
          animation = elementCmp.definition.motion?.buildOut;
          noMotion = PebBuildOutAnimationType.None;
          break;
      }

      const initialValue = {
        type: animation?.type ?? noMotion,
        delay: animation?.delay ?? 0,
        duration: animation?.duration ?? 1,
        order: animation?.order ?? 1,
        delivery: animation?.delivery ?? PebMotionDelivery.AtOnce,
        event: animation?.event ?? motionEvent,
        eventType: animation?.eventType ?? motionEventType,
        direction: getPebAnimationTypeConfig(animation?.type ?? noMotion)?.hasDirection ?
          animation?.direction ?? PebMotionDirection.LeftToRight : null,
        textDelivery: elementCmp.definition.type === PebElementType.Text ?
          animation?.textDelivery ?? PebMotionTextDelivery.Object : null,
      };

      const motionProperty = {
        initialValue,
        form: this.formBuilder.group({
          type: [initialValue.type],
          delay: [initialValue.delay],
          duration: [initialValue.duration],
          order: [initialValue.order],
          delivery: [initialValue.delivery],
          event: [initialValue.event],
          eventType: [initialValue.eventType],
          direction: [initialValue.direction],
          textDelivery: [initialValue.textDelivery],
        }),
        update: null,
        submit: new Subject<any>(),
      };

      switch (motionType) {
        case PebMotionType.BuildIn:
          elementCmp.buildIn = motionProperty;
          break;
        case PebMotionType.Action:
          elementCmp.action = motionProperty;
          break;
        case PebMotionType.BuildOut:
          elementCmp.buildOut = motionProperty;
          break;
      }
    });
  }

  private openMotionSidebar(
    elCmp: PebEditorElement,
    element: PebElementDef,
  ): Observable<any> {
    const sidebarCmpRef = this.editor.openSidebarMotion(this.sidebarComponent);
    sidebarCmpRef.instance.component = elCmp;
    sidebarCmpRef.instance.element = element;
    sidebarCmpRef.changeDetectorRef.detectChanges();

    return merge(
      this.handlePreview(sidebarCmpRef.instance, elCmp),
      this.trackSidebarChanges(sidebarCmpRef.instance, elCmp),
    ).pipe(
      takeUntil(this.selectedElements$.pipe(skip(1))),
      finalize(() => {
        sidebarCmpRef.destroy();
      }),
    );
  }

  handlePreview(
    sidebar: PebEditorMotionSidebarComponent,
    elementCmp: PebEditorElement,
  ): Observable<any> {
    return sidebar.previewMotion.pipe(
      map(({ motionType }) => {
        let animation: PebAnimation;
        const motion = elementCmp.definition.motion;
        switch (motionType) {
          case PebMotionType.BuildIn:
            animation = motion?.buildIn;
            break;
          case PebMotionType.BuildOut:
            animation = motion?.buildOut;
            break;
          case PebMotionType.Action:
            animation = motion?.action;
            break;
        }

        return { animation, motionType };
      }),
      filter(({ animation }) => !!animation),
      switchMap(({ motionType, animation }) => {
        this.state.animating = true;
        elementCmp.animating = true;

        const animationStates = getPebMotionEventTypeConfig(animation?.eventType)?.animationStates;
        const animationTypeConfig = getPebAnimationTypeConfig(animation?.type);
        const stateAnimations = animationStates?.reduce(
          (acc, state) => {
            const stateAnimation = animationTypeConfig?.animationStatesMatcher?.[state];
            if (stateAnimation) {
              acc.push({
                animation: lMerge({}, animation, stateAnimation.animation),
                motionType: stateAnimation.motionType,
              });
            }

            return acc;
          },
          [],
        ) ?? [];

        return iif(
          () => !!stateAnimations.length,
          concat(...stateAnimations.map((stateAnimation, i) => {
            return of(undefined).pipe(
              switchMap(() => elementCmp.applyAnimation(
                stateAnimation.animation,
                stateAnimation.motionType,
                {
                  restore: i !== stateAnimations.length - 1,
                },
              )),
            );
          })),
          elementCmp.applyAnimation(
            animation,
            motionType,
            {
              restore: true,
            },
          ),
        ).pipe(
          finalize(() => {
            this.state.animating = false;
            elementCmp.animating = false;
          }),
        );
      }),
    );
  }

  trackSidebarChanges(
    sidebar: PebEditorMotionSidebarComponent,
    elementCmp: PebEditorElement,
  ): Observable<any> {
    return sidebar.changeMotion.pipe(
      switchMap((motion: PebMotion) => {
        elementCmp.definition.motion = motion;
        const nextDefinition: PebElementDef = {
          ...elementCmp.definition,
          motion,
        };
        const effects = [];

        return this.editorStore.updateElement(nextDefinition, effects);
      }),
    );
  }

  orderCount(elementCmp: PebEditorElement) {
    return elementCmp.parent?.children?.
      filter(elCmp => elCmp.definition?.motion).
      reduce((acc, elCmp) => {
        const motionCount = Object.entries(elCmp.definition.motion)
          .filter(([type, animation]) => animation?.type && animation.type.toLowerCase() !== 'none').length;

        return acc + motionCount;
      }, 0);
  }
}
