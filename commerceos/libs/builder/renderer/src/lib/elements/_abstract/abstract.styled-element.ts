import { AnimationBuilder, AnimationPlayer } from '@angular/animations';
import { ChangeDetectorRef, ComponentRef, Directive, ElementRef, Injector, Input, Renderer2 } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

import { PebAnimation, PebAnimationType, PebElementDef, PebMotionType } from '@pe/builder-core';

import { createAnimation, createRestoreAnimation } from '../../animations/animations';
import { PebEditorOptions } from '../../state';

@Directive()
export abstract class PebAbstractStyledElement {
  @Input() element: PebElementDef;
  @Input() options: PebEditorOptions;
  @Input() index: number;
  @Input() length: number;

  wrapperCmp: ComponentRef<PebAbstractStyledElement>;

  get contentContainer(): HTMLElement {
    return this.nativeElement;
  }

  get nativeElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  protected get elements(): { [key: string]: HTMLElement | HTMLElement[]} {
    return undefined;
  }

  protected abstract get mappedStyles();

  protected animationPlayer: AnimationPlayer;

  constructor(
    public injector: Injector,
    protected elementRef: ElementRef,
    protected renderer: Renderer2,
    public cdr: ChangeDetectorRef,
    protected animationBuilder: AnimationBuilder,
  ) {
  }

  applyAnimation(
    animation: PebAnimation,
    motionType: PebMotionType,
    { restore = false, animationType = animation.type, duration = animation.duration }: {
      restore?: boolean,
      animationType?: PebAnimationType,
      duration?: number,
    } = {},
  ): Observable<void> {
    const result$ = new Subject<void>();
    const appliedAnimation = { ...animation, duration, type: animationType };
    const builderAnimation = createAnimation(appliedAnimation, motionType, this.mappedStyles.host ?? {});
    const builderAnimationRestore = restore ? createRestoreAnimation(appliedAnimation) : [];
    const animationFactory = this.animationBuilder.build([...builderAnimation, ...builderAnimationRestore]);
    const player = animationFactory.create(this.elementRef.nativeElement);
    player.onStart(() => {
      this.animationPlayer = player;
    });
    player.onDone(() => {
      this.animationPlayer = null;
      result$.next();
      result$.complete();
    });
    player.play();

    return result$.asObservable();
  }

  applyBuildInAnimation(): Observable<void> {
    if (this.element.motion?.buildIn) {
      return this.applyAnimation(this.element.motion.buildIn, PebMotionType.BuildIn);
    }

    return of(undefined);
  }

  applyBuildOutAnimation(): Observable<void> {
    if (this.element.motion?.buildOut) {
      return this.applyAnimation(this.element.motion.buildOut, PebMotionType.BuildOut);
    }

    return of(undefined);
  }
}
