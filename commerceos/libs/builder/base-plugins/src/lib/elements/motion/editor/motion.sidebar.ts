import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { detailedDiff } from 'deep-object-diff';
import { BehaviorSubject, merge, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import { MediaService, PebEditorApi } from '@pe/builder-api';
import {
  PebActionAnimationType,
  PebAnimation,
  PebBuildInAnimationType,
  PebBuildOutAnimationType,
  PebElementDef,
  PebElementStyles,
  PebElementType,
  PebMotion,
  PebMotionDelivery,
  PebMotionDirection,
  PebMotionEvent,
  PebMotionEventType,
  PebMotionTextDelivery,
  PebMotionType,
} from '@pe/builder-core';
import { PebEditorElement } from '@pe/builder-main-renderer';
import {
  getPebAnimationTypeConfig,
  getPebMotionDirectionConfig,
  getPebMotionEventConfig,
  getPebMotionEventTypeConfig,
  getPebMotionTypeConfig,
} from '@pe/builder-renderer';
import { PebEditorAccessorService, PebEditorStore } from '@pe/builder-services';
import { EditorBuildOrderForm, PebMotionDetailForm } from '@pe/builder-shared';


export enum MotionActionType {
  Preview = 'Preview animation',
  BuildOrder = 'Build order',
  AddAction = 'Add action',
}

export enum MotionEffectType {
  Delay = 'Delay',
  Duration = 'Duration',
  Order = 'Motion Order',
}

@Component({
  selector: 'peb-motion',
  templateUrl: './motion.sidebar.html',
  styleUrls: ['./motion.sidebar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PebEditorMotionSidebarComponent implements OnInit, OnDestroy {

  @Input() component: PebEditorElement;
  @Input() styles: PebElementStyles;
  @Input() element: PebElementDef;

  @Output() changeMotion = new EventEmitter<PebMotion>();

  @Output() changeBuildIn = new EventEmitter<PebAnimation>();
  @Output() changeAction = new EventEmitter<PebAnimation>();
  @Output() changeBuildOut = new EventEmitter<PebAnimation>();

  @Output() previewMotion = new EventEmitter<any>();


  form: FormGroup;
  activeTabIndex$ = new BehaviorSubject<number>(0);

  PebMotionType = PebMotionType;
  motionEffects = Object.values(MotionEffectType);
  getPebMotionTypeConfig = getPebMotionTypeConfig;

  private readonly destroy$ = new Subject<void>();

  readonly motionTypes = Object.values(PebMotionType);
  readonly PebMotionEvent = PebMotionEvent;
  readonly deliveryTypes = Object.values(PebMotionDelivery);
  readonly textDeliveryTypes = Object.values(PebMotionTextDelivery);
  readonly directionTypes = Object.values(PebMotionDirection);
  readonly PebElementType = PebElementType;

  buildIn: PebAnimation;
  action: PebAnimation;
  buildOut: PebAnimation;

  private get editor() {
    return this.editorAccessorService.editorComponent;
  }

  constructor(
    public api: PebEditorApi,
    public mediaService: MediaService,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private editorStore: PebEditorStore,
    public cdr: ChangeDetectorRef,
    private editorAccessorService: PebEditorAccessorService,
  ) {
  }

  ngOnInit() {
    this.initForm();
    this.watchOnChanges();
    this.activeTabIndex$ = new BehaviorSubject<number>(0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private initForm() {
    this.form = this.formBuilder.group({
      type: this.component.buildIn?.initialValue.type,
      order: this.component.buildIn?.initialValue.order ?? 1,
      duration: this.component.buildIn?.initialValue.duration,
      delay: this.component.buildIn?.initialValue.delay,
    });
    this.buildIn = this.component.buildIn?.initialValue;
    this.action = this.component.action?.initialValue;
    this.buildOut = this.component.buildOut?.initialValue;
  }

  initMotion(motionType: PebMotionType): PebAnimation {
    switch (motionType) {
      case PebMotionType.BuildIn:
        return this.buildIn;
      case PebMotionType.Action:
        return this.action;
      case PebMotionType.BuildOut:
        return this.buildOut;
    }
  }

  eventTypes(motionType) {
    return Object.values(PebMotionEvent)
      .filter(event => event !== (motionType === PebMotionType.BuildIn ? PebMotionEvent.After : PebMotionEvent.OnLoad));
  }

  getEventOptions(motionType: PebMotionType): Array<{ name: string, value: string }> {
    let events = [];
    switch (motionType) {
      case PebMotionType.Action:
        if (this.component.definition.type === PebElementType.Shape) {
          // cart animation only for shape
          events = [PebMotionEvent.None, PebMotionEvent.OnDataPoint];
        }
        break;
      case PebMotionType.BuildIn:
        events = [PebMotionEvent.OnLoad];
        break;
    }

    return events.map(et => ({ name: getPebMotionEventConfig(et)?.title ?? et, value: et }));
  }

  getAnimationTypeOptions(motionType: PebMotionType): Array<{ name: string, value: string }> {
    let animationTypes = [];
    switch (motionType) {
      case PebMotionType.Action:
        // TODO: filter by possible states
        animationTypes = Object.values(PebActionAnimationType);
        break;
      case PebMotionType.BuildIn:
        animationTypes = Object.values(PebBuildInAnimationType);
        break;
      case PebMotionType.BuildOut:
        animationTypes = Object.values(PebBuildOutAnimationType);
    }

    return animationTypes.map(at => ({ name: getPebAnimationTypeConfig(at)?.title ?? at, value: at }));
  }

  getMotionDirectionOptions(): Array<{ name: string, value: string }> {
    return Object.values(PebMotionDirection)
      .map(d => ({ name: getPebMotionDirectionConfig(d)?.title ?? d, value: d }));
  }

  getMotionEventTypeOptions(): Array<{ name: string, value: string }> {
    return Object.values(PebMotionEventType)
      .map(met => ({ name: getPebMotionEventTypeConfig(met)?.title ?? met, value: met }));
  }

  motionActions(motionType) {
    return Object.values(MotionActionType)
        .filter(event => event !== MotionActionType.AddAction && event !== MotionActionType.BuildOrder);
  }

  hasMotion(motionType: PebMotionType) {
    const motion = this.initMotion(motionType);

    return motion && motion.type !== 'none' &&
      (motionType !== PebMotionType.Action || motion.event !== PebMotionEvent.None);
  }

  selectAction(action: MotionActionType, motionType: PebMotionType) {
    const form = this.getFormGroup(motionType);
    switch (action) {
      case MotionActionType.Preview:
        // const animation = {
        //   type: form?.get('type')?.value,
        //   delay: form?.get('delay')?.value,
        //   duration: form?.get('duration')?.value,
        //   order: form?.get('order')?.value,
        // };
        this.previewMotion.emit({ motionType });
        break;
      case MotionActionType.BuildOrder:
        this.showBuildOrder();
        break;
      case MotionActionType.AddAction:
        this.addAction(motionType, form);
        break;
      default:
        break;
    }
  }

  showBuildOrder() {
    this.editor.detail = { back: 'Motion', title: 'Build Order' };
    const sidebarCmpRef = this.editor.insertToSlot(EditorBuildOrderForm, PebEditorSlot.sidebarDetail);
    sidebarCmpRef.instance.formGroup = this.form;
    sidebarCmpRef.instance.orders = this.component.parent?.children?.
      filter(el => el.definition.motion)?.
      reduce((acc, el) => {
        const onclickAnimations = Object.entries(el.definition.motion)
          .filter(([_, animation]) => animation && animation.type !== 'NONE');
        onclickAnimations
          .forEach(([motionType, a]) => acc.push({ motionType, element: el, animation: a }));

        return acc;
      }, [])
      ?.sort((a1, a2) => a1.animation.order - a2.animation.order);
  }

  addAction(motionType: PebMotionType, form: FormGroup) {
    this.editor.detail = { back: 'Motion', title: motionType };
    const sidebarCmpRef = this.editor.insertToSlot(PebMotionDetailForm, PebEditorSlot.sidebarDetail);
    sidebarCmpRef.instance.formGroup = form;
    sidebarCmpRef.instance.motionType = motionType;
  }

  getFormControl(name: string, motionType: PebMotionType): FormControl {
    let formValue: string;
    switch (name) {
      case MotionEffectType.Delay:
        formValue = 'delay';
        break;
      case MotionEffectType.Duration:
        formValue = 'duration';
        break;
      case MotionEffectType.Order:
        formValue = 'order';
        break;
      default:
        formValue = 'delay';
    }

    return this.getFormGroup(motionType)?.get(formValue) as FormControl;
  }

  hasTextDelivery(motionType: PebMotionType) {
    return this.initMotion(motionType)?.textDelivery;
  }

  hasDirection(motionType: PebMotionType): boolean {
    return getPebAnimationTypeConfig(this.initMotion(motionType)?.type)?.hasDirection;
  }

  getFormGroup(motionType: PebMotionType): FormGroup {
    switch (motionType) {
      case PebMotionType.BuildIn:
        return this.component.buildIn?.form;
      case PebMotionType.Action:
        return this.component.action?.form;
      case PebMotionType.BuildOut:
        return this.component.buildOut?.form;
      default:
        return this.component.buildIn?.form;
    }
  }

  unit(name: string) {
    switch (name) {
      case MotionEffectType.Delay:
      case MotionEffectType.Duration:
        return 's';
      case MotionEffectType.Order:
        return `/${this.orderCount()}`;
      default:
        return 's';
    }
  }

  orderCount() {
    return this.component.parent?.children?.
      filter(elCmp => elCmp.definition?.motion).
      reduce((acc, elCmp) => {
        const motionCount = Object.entries(elCmp.definition.motion)
          .filter(([type, animation]) => animation && animation.type !== 'NONE').length;

        return acc + motionCount;
      }, 0) ?? 1;
  }

  private watchOnChanges() {
    merge(
      this.component.buildIn?.form.valueChanges.pipe(
        tap((animation) => {
          if (!this.diff(this.buildIn, animation)) {return;}
          this.buildIn = animation;
          this.changeMotions(PebMotionType.BuildIn, this.buildIn);
        }),
      ),
      this.component.action?.form.valueChanges.pipe(
        tap((animation) => {
          if (!this.diff(this.action, animation)) {return;}
          this.action = animation;
          this.changeMotions(PebMotionType.Action, this.action);
        }),
      ),
      this.component.buildOut?.form.valueChanges.pipe(
        tap((animation) => {
          if (!this.diff(this.buildOut, animation)) {return;}
          this.buildOut = animation;
          this.changeMotions(PebMotionType.BuildOut, this.buildOut);
        }),
      ),
    ).pipe(
      tap(() => this.cdr.detectChanges()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  changeMotions(motionType: PebMotionType, animation: PebAnimation) {
    if (
      (!this.preAnimation(motionType) || this.preAnimation(motionType).type === 'none') &&
      animation.type !== 'none'
    ) {
      const order = this.orderCount() + 1;
      this.getFormControl(MotionEffectType.Order, motionType)?.patchValue(order, { emitEvent: false });
      animation.order = order;
    }
    const animationTypeConfig = getPebAnimationTypeConfig(animation.type);
    if (animationTypeConfig?.hasDirection && !this.preAnimation(motionType)?.direction) {
      this.getFormGroup(motionType)?.get('direction').patchValue(PebMotionDirection.LeftToRight, { emitEvent: false });
      animation.direction = PebMotionDirection.LeftToRight;
    } else if (!animationTypeConfig?.hasDirection) {
      animation.direction = null;
    }

    this.element.motion = {
      buildIn: this.buildIn,
      action: this.action,
      buildOut: this.buildOut,
    };
    this.changeMotion.emit(this.element.motion);
  }

  preAnimation(motionType: PebMotionType) {
    const motion = this.element.motion;

    return motionType === PebMotionType.BuildIn ? motion?.buildIn :
      motionType === PebMotionType.Action ? motion?.action : motion?.buildOut;
  }

  diff(oldMotion: PebAnimation, newMotion: PebAnimation): boolean {
    const motionChanges = detailedDiff(oldMotion, newMotion) as any;

    return Object.keys(motionChanges?.added).length !== 0
      || Object.keys(motionChanges?.deleted).length !== 0
      || Object.keys(motionChanges?.updated).length !== 0;
  }
}

