import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MediaService, PebEditorApi } from '@pe/builder-api';
import {
  PebActionAnimationType,
  PebBuildInAnimationType,
  PebBuildOutAnimationType,
  PebElementType,
  PebMotionDirection,
  PebMotionEvent,
  PebMotionTextDelivery,
  PebMotionType,
} from '@pe/builder-core';
import {
  EditorBuildOrderForm,
  PebEditorAccessorService,
  PebEditorSlot,
  PebEditorStore,
  PebMotionDetailForm,
} from '@pe/builder-shared';
import { MotionActionType, MotionEffectType, PebEditorMotionSidebarComponent } from './motion.sidebar';

describe('PebEditorMotionSidebarComponent', () => {

  let fixture: ComponentFixture<PebEditorMotionSidebarComponent>;
  let component: PebEditorMotionSidebarComponent;
  let editorComponent: {
    detail: any;
    insertToSlot: jasmine.Spy;
  };

  beforeEach(waitForAsync(() => {

    editorComponent = {
      detail: null,
      insertToSlot: jasmine.createSpy('insertToSlot'),
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorMotionSidebarComponent],
      providers: [
        FormBuilder,
        { provide: PebEditorApi, useValue: {} },
        { provide: MediaService, useValue: {} },
        { provide: MatDialog, useValue: {} },
        { provide: PebEditorStore, useValue: {} },
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorMotionSidebarComponent);
      component = fixture.componentInstance;
      component.element = {
        id: 'elem',
        type: PebElementType.Shape,
        motion: null,
      };
      component.component = {
        definition: {
          id: 'elem',
          type: PebElementType.Section,
        },
        buildIn: {
          initialValue: {},
          form: new FormGroup({}),
        },
        buildOut: {
          initialValue: {},
          form: new FormGroup({}),
        },
        action: {
          initialValue: {},
          form: new FormGroup({}),
        },
        parent: null,
      } as any;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get editor', () => {

    expect(component[`editor`]).toEqual(editorComponent as any);

  });

  it('should handle ng init', () => {

    const initFormSpy = spyOn<any>(component, 'initForm');
    const watchSpy = spyOn<any>(component, 'watchOnChanges');

    component.ngOnInit();

    expect(initFormSpy).toHaveBeenCalled();
    expect(watchSpy).toHaveBeenCalled();
    expect(component.activeTabIndex$.value).toBe(0);

  });

  it('should init form', () => {

    /**
     * component.component.buildIn, buildOut & action are null
     */
    component.component.buildIn = null;
    component.component.buildOut = null;
    component.component.action = null;
    component[`initForm`]();

    expect(component.form.value).toEqual({
      type: null,
      order: 1,
      duration: null,
      delay: null,
    });
    expect(component.buildIn).toBeUndefined();
    expect(component.action).toBeUndefined();
    expect(component.buildOut).toBeUndefined();

    /**
     * component.component.buildIn, buildOut & action are set
     */
    component.component.buildIn = {
      initialValue: {
        type: PebBuildInAnimationType.Blur,
        order: 3,
        duration: 300,
        delay: 350,
      },
    } as any;
    component.component.action = {
      initialValue: {
        type: PebBuildInAnimationType.MoveIn,
        order: 8,
        duration: 1000,
        delay: 100,
      },
    } as any;
    component.component.buildOut = {
      initialValue: {
        type: PebBuildInAnimationType.Drift,
        order: 10,
        duration: 100,
        delay: 200,
      },
    } as any;
    component[`initForm`]();

    expect(component.form.value).toEqual({
      type: PebBuildInAnimationType.Blur,
      order: 3,
      duration: 300,
      delay: 350,
    });
    expect(component.buildIn).toEqual(component.component.buildIn.initialValue);
    expect(component.action).toEqual(component.component.action.initialValue);
    expect(component.buildOut).toEqual(component.component.buildOut.initialValue);

  });

  it('should init motion', () => {

    const buildIn: any = { type: PebBuildInAnimationType.Blur };
    const action: any = { type: PebActionAnimationType.Dissolve };
    const buildOut: any = { type: PebBuildOutAnimationType.MoveOut };

    component.buildIn = buildIn;
    component.action = action;
    component.buildOut = buildOut;

    expect(component.initMotion(PebMotionType.BuildOut)).toEqual(buildOut);
    expect(component.initMotion(PebMotionType.Action)).toEqual(action);
    expect(component.initMotion(PebMotionType.BuildIn)).toEqual(buildIn);

  });

  it('should get event types', () => {

    expect(component.eventTypes(PebMotionType.BuildIn))
      .toEqual(Object.values(PebMotionEvent).filter(event => event !== PebMotionEvent.After));
    expect(component.eventTypes(PebMotionType.Action))
      .toEqual(Object.values(PebMotionEvent).filter(event => event !== PebMotionEvent.OnLoad));

  });

  it('should get event options', () => {

    /**
     * argument motionType is PebMotionType.BuildIn
     */
    expect(component.getEventOptions(PebMotionType.BuildIn)).toEqual([{
      name: 'On Load',
      value: 'on-load',
    }]);

    /**
     * argument motionType is PebMotionType.Action
     * component.component.definition.type is PebElementType.Section
     */
    expect(component.getEventOptions(PebMotionType.Action)).toEqual([]);

    /**
     * component.component.definition.type is PebElementType.Shape
     */
    component.component.definition.type = PebElementType.Shape;
    expect(component.getEventOptions(PebMotionType.Action)).toEqual([
      {
        name: 'None',
        value: 'none',
      },
      {
        name: 'On Data Point',
        value: 'on-data-point',
      },
    ]);

  });

  it('should get animation type options', () => {

    function typeToOption(type: string): { name: string; value: string; } {
      return {
        name: type.split('-').map((v, i) => i === 0 ? `${v.charAt(0).toUpperCase()}${v.slice(1)}` : v).join(' '),
        value: type,
      };
    }

    expect(component.getAnimationTypeOptions(PebMotionType.Action))
      .toEqual(Object.values(PebActionAnimationType).map(typeToOption));

    expect(component.getAnimationTypeOptions(PebMotionType.BuildIn))
      .toEqual(Object.values(PebBuildInAnimationType).map(typeToOption));

    expect(component.getAnimationTypeOptions(PebMotionType.BuildOut))
      .toEqual(Object.values(PebBuildOutAnimationType).map(typeToOption));

  });

  it('should get motion direction options', () => {

    function directionToOption(direction: string): { name: string; value: string; } {
      return {
        name: direction.split('-').map(v => `${v.charAt(0).toUpperCase()}${v.slice(1)}`).join(' '),
        value: direction,
      };
    }

    expect(component.getMotionDirectionOptions())
      .toEqual(Object.values(PebMotionDirection).map(directionToOption));

  });

  it('should get motion event type options', () => {

    expect(component.getMotionEventTypeOptions()).toEqual([
      {
        name: 'Basket fill',
        value: 'basket-fill',
      },
      {
        name: 'Snackbar',
        value: 'snackbar',
      },
    ]);

  });

  it('should get motion actions', () => {

    expect(component.motionActions(null)).toEqual([MotionActionType.Preview]);

  });

  it('should check if has motion', () => {

    const buildIn: any = {
      type: PebBuildInAnimationType.Dissolve,
      event: PebMotionEvent.OnLoad,
    };
    const action: any = {
      type: PebActionAnimationType.Dissolve,
      event: PebMotionEvent.None,
    };

    component.buildIn = buildIn;
    component.action = action;
    expect(component.hasMotion(PebMotionType.Action)).toBe(false);
    expect(component.hasMotion(PebMotionType.BuildIn)).toBe(true);

  });

  it('should select action', () => {

    const formMock: any = { test: 'form' };
    const getFormSpy = spyOn(component, 'getFormGroup').and.returnValue(formMock);
    const emitSpy = spyOn(component.previewMotion, 'emit');
    const showSpy = spyOn(component, 'showBuildOrder');
    const addSpy = spyOn(component, 'addAction');

    /**
     * argument action is null
     */
    component.selectAction(null, PebMotionType.BuildIn);

    expect(getFormSpy).toHaveBeenCalledWith(PebMotionType.BuildIn);
    expect(emitSpy).not.toHaveBeenCalled();
    expect(showSpy).not.toHaveBeenCalled();
    expect(addSpy).not.toHaveBeenCalled();

    /**
     * argument action is MotionActionType.Preview
     */
    component.selectAction(MotionActionType.Preview, PebMotionType.BuildIn);

    expect(emitSpy).toHaveBeenCalledWith({
      motionType: PebMotionType.BuildIn,
    });
    expect(showSpy).not.toHaveBeenCalled();
    expect(addSpy).not.toHaveBeenCalled();

    /**
     * argument action is MotionActionType.BuildOrder
     */
    emitSpy.calls.reset();

    component.selectAction(MotionActionType.BuildOrder, PebMotionType.Action);

    expect(showSpy).toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
    expect(addSpy).not.toHaveBeenCalled();

    /**
     * argument action is MotionActionType.AddAction
     */
    showSpy.calls.reset();

    component.selectAction(MotionActionType.AddAction, PebMotionType.Action);

    expect(addSpy).toHaveBeenCalledWith(PebMotionType.Action, formMock);
    expect(emitSpy).not.toHaveBeenCalled();
    expect(showSpy).not.toHaveBeenCalled();

  });

  it('should show build order', () => {

    const sidebarCmpRef = {
      instance: {
        formGroup: null,
        orders: null,
      },
    };
    const formMock: any = { test: 'form' };
    const parentMock = {
      children: null,
    };
    const childMock = {
      definition: {
        motion: {
          [PebMotionType.BuildIn]: { type: PebBuildOutAnimationType.Blur, order: 2 },
          [PebMotionType.Action]: { type: PebActionAnimationType.Move, order: 3 },
          [PebMotionType.BuildOut]: { type: PebBuildOutAnimationType.Dissolve, order: 1 },
        },
      },
    };

    editorComponent.insertToSlot.and.returnValue(sidebarCmpRef);

    /**
     * component.component.parent is null
     */
    component.form = formMock;
    component.showBuildOrder();

    expect(editorComponent.detail).toEqual({ back: 'Motion', title: 'Build Order' });
    expect(editorComponent.insertToSlot).toHaveBeenCalledWith(
      EditorBuildOrderForm,
      PebEditorSlot.sidebarDetail,
    );
    expect(sidebarCmpRef.instance).toEqual({
      formGroup: formMock,
      orders: undefined,
    });

    /**
     * component.component.parent.children is null
     */
    component.component[`parent` as any] = parentMock as any;
    component.showBuildOrder();

    expect(sidebarCmpRef.instance.orders).toBeUndefined();

    /**
     * component.component.parent.children is set
     */
    parentMock.children = [childMock];
    component.showBuildOrder();

    expect(sidebarCmpRef.instance.orders).toEqual(
      Object.entries(childMock.definition.motion)
        .map(([motionType, animation]) => ({
          motionType,
          animation,
          element: childMock,
        }))
        .sort((a, b) => a.animation.order - b.animation.order),
    );

  });

  it('should add action', () => {

    const sidebarCmpRef = {
      instance: {
        formGroup: null,
        motionType: null,
      },
    };
    const formMock: any = { test: 'form' };

    editorComponent.insertToSlot.and.returnValue(sidebarCmpRef);

    component.addAction(PebMotionType.BuildOut, formMock);

    expect(editorComponent.detail).toEqual({ back: 'Motion', title: PebMotionType.BuildOut });
    expect(editorComponent.insertToSlot).toHaveBeenCalledWith(
      PebMotionDetailForm,
      PebEditorSlot.sidebarDetail,
    );
    expect(sidebarCmpRef.instance.formGroup).toEqual(formMock);
    expect(sidebarCmpRef.instance.motionType).toEqual(PebMotionType.BuildOut);

  });

  it('should get form control', () => {

    const formMock = new FormGroup({
      delay: new FormControl(200),
      duration: new FormControl(1000),
      order: new FormControl(3),
    });
    const getFormSpy = spyOn(component, 'getFormGroup').and.returnValue(null);

    /**
     * argument name is null
     * component.getFormGroup returns null
     */
    expect(component.getFormControl(null, PebMotionType.BuildOut)).toBeUndefined();
    expect(getFormSpy).toHaveBeenCalledWith(PebMotionType.BuildOut);

    /**
     * component.getFormGroup returns mocked data
     */
    getFormSpy.and.returnValue(formMock);

    expect(component.getFormControl(null, PebMotionType.BuildOut))
      .toEqual(formMock.controls.delay as FormControl);

    /**
     * argument name is MotionEffectType.Order
     */
    expect(component.getFormControl(MotionEffectType.Order, PebMotionType.BuildOut))
      .toEqual(formMock.controls.order as FormControl);

    /**
     * argument name is MotionEffectType.Duration
     */
    expect(component.getFormControl(MotionEffectType.Duration, PebMotionType.BuildOut))
      .toEqual(formMock.controls.duration as FormControl);

    /**
     * argument name is MotionEffectType.Delay
     */
    expect(component.getFormControl(MotionEffectType.Delay, PebMotionType.BuildOut))
      .toEqual(formMock.controls.delay as FormControl);

  });

  it('should check if has text delivery', () => {

    const buildIn: any = { textDelivery: PebMotionTextDelivery.Object };

    component.buildIn = buildIn;
    component.action = null;
    expect(component.hasTextDelivery(PebMotionType.Action)).toBeUndefined();
    expect(component.hasTextDelivery(PebMotionType.BuildIn)).toEqual(buildIn.textDelivery);

  });

  it('should check if has direction', () => {

    const buildIn: any = { type: PebBuildInAnimationType.Drift };
    const action: any = { type: PebActionAnimationType.Blur };

    component.buildIn = buildIn;
    component.action = action;
    component.buildOut = null;
    expect(component.hasDirection(PebMotionType.Action)).toBeUndefined();
    expect(component.hasDirection(PebMotionType.BuildOut)).toBeUndefined();
    expect(component.hasDirection(PebMotionType.BuildIn)).toBe(true);

  });

  it('should get form group', () => {

    const buildIn: any = { form: { test: 'buildIn.form' } };
    const action: any = { form: { test: 'action.form' } };
    const buildOut: any = { form: { test: 'buildOut.form' } };
    const typeFormMap = new Map<PebMotionType, { form: any }>([
      [PebMotionType.BuildIn, buildIn],
      [PebMotionType.Action, action],
      [PebMotionType.BuildOut, buildOut],
      [null, buildIn],
    ]);

    /**
     * component.component.buildIn, action & buildOut are null
     */
    component.component.buildIn = null;
    component.component.action = null;
    component.component.buildOut = null;

    typeFormMap.forEach((_, motionType) => {
      expect(component.getFormGroup(motionType)).toBeUndefined();
    });

    /**
     * component.buildIn, action & buildOut are set
     */
    component.component.buildIn = buildIn;
    component.component.action = action;
    component.component.buildOut = buildOut;

    typeFormMap.forEach((value, motionType) => {
      expect(component.getFormGroup(motionType)).toEqual(value.form);
    });

  });

  it('should get unit', () => {

    const orderCountSpy = spyOn(component, 'orderCount').and.returnValue(13);

    expect(component.unit(null)).toEqual('s');
    expect(component.unit(MotionEffectType.Delay)).toEqual('s');
    expect(component.unit(MotionEffectType.Duration)).toEqual('s');
    expect(orderCountSpy).not.toHaveBeenCalled();
    expect(component.unit(MotionEffectType.Order)).toEqual('/13');
    expect(orderCountSpy).toHaveBeenCalledTimes(1);

  });

  it('should get order count', () => {

    const parentMock = {
      children: null,
    };
    const childrenMock = [
      { definition: null },
      {
        definition: {
          motion: {
            [PebMotionType.BuildIn]: { type: PebBuildInAnimationType.Blur, order: 2 },
            [PebMotionType.Action]: { type: PebActionAnimationType.Move, order: 3 },
            [PebMotionType.BuildOut]: { type: PebBuildOutAnimationType.Dissolve, order: 1 },
          },
        },
      },
      {
        definition: {
          motion: {
            [PebMotionType.BuildIn]: { type: PebBuildInAnimationType.MoveIn, order: 1 },
          },
        },
      },
    ];

    /**
     * component.component.parent is null
     */
    expect(component.orderCount()).toBe(1);

    /**
     * component.component.parent.children is null
     */
    component.component[`parent` as any] = parentMock;
    expect(component.orderCount()).toBe(1);

    /**
     * component.component.parent.children is set
     */
    parentMock.children = childrenMock;
    expect(component.orderCount()).toBe(4);

  });

  it('should watch on changes', () => {

    const detectSpy = spyOn(component.cdr, 'detectChanges');
    const changeSpy = spyOn(component, 'changeMotions');
    const diffSpy = spyOn(component, 'diff').and.returnValue(false);
    const buildIn = {
      initialValue: {
        type: PebBuildInAnimationType.Dissolve,
        duration: null,
      } as any,
      form: new FormGroup({
        type: new FormControl(PebBuildInAnimationType.Dissolve),
        duration: new FormControl(),
      }),
    };
    const action = {
      initialValue: {
        type: PebActionAnimationType.Dissolve,
        duration: null,
      } as any,
      form: new FormGroup({
        type: new FormControl(PebActionAnimationType.Dissolve),
        duration: new FormControl(),
      }),
    };
    const buildOut = {
      initialValue: {
        type: PebBuildOutAnimationType.Dissolve,
        duration: null,
      } as any,
      form: new FormGroup({
        type: new FormControl(PebBuildOutAnimationType.Dissolve),
        duration: new FormControl(),
      }),
    };

    component.component.buildIn = buildIn as any;
    component.component.action = action as any;
    component.component.buildOut = buildOut as any;
    component.buildIn = buildIn.initialValue;
    component.action = action.initialValue;
    component.buildOut = buildOut.initialValue;
    component[`watchOnChanges`]();

    /**
     * component.diff returns FALSE
     * change buildIn
     */
    buildIn.form.patchValue({
      duration: 1000,
    });

    expect(diffSpy).toHaveBeenCalledWith(buildIn.initialValue, buildIn.form.value);
    expect(changeSpy).not.toHaveBeenCalled();
    expect(detectSpy).toHaveBeenCalled();

    /**
     * change action
     */
    diffSpy.calls.reset();
    action.form.patchValue({
      duration: 1500,
    });

    expect(diffSpy).toHaveBeenCalledWith(action.initialValue, action.form.value);
    expect(changeSpy).not.toHaveBeenCalled();

    /**
     * change buildOut
     */
    diffSpy.calls.reset();
    buildOut.form.patchValue({
      duration: 500,
    });

    expect(diffSpy).toHaveBeenCalledWith(buildOut.initialValue, buildOut.form.value);
    expect(changeSpy).not.toHaveBeenCalled();


    /**
     * component.diff returns TRUE
     * change buildIn
     */
    diffSpy.calls.reset();
    diffSpy.and.returnValue(true);
    buildIn.form.patchValue({
      duration: 5000,
    });

    expect(diffSpy).toHaveBeenCalledWith(buildIn.initialValue, buildIn.form.value);
    expect(component.buildIn).toEqual(buildIn.form.value);
    expect(changeSpy).toHaveBeenCalledWith(PebMotionType.BuildIn, buildIn.form.value);

    /**
     * change action
     */
    diffSpy.calls.reset();
    changeSpy.calls.reset();
    action.form.patchValue({
      duration: 1300,
    });

    expect(diffSpy).toHaveBeenCalledWith(action.initialValue, action.form.value);
    expect(component.action).toEqual(action.form.value);
    expect(changeSpy).toHaveBeenCalledWith(PebMotionType.Action, action.form.value);

    /**
     * change buildOut
     */
    diffSpy.calls.reset();
    changeSpy.calls.reset();
    buildOut.form.patchValue({
      duration: 2500,
    });

    expect(diffSpy).toHaveBeenCalledWith(buildOut.initialValue, buildOut.form.value);
    expect(component.buildOut).toEqual(buildOut.form.value);
    expect(changeSpy).toHaveBeenCalledWith(PebMotionType.BuildOut, buildOut.form.value);

  });

  it('should change motions', () => {

    const preSpy = spyOn(component, 'preAnimation');
    const getControlSpy = spyOn(component, 'getFormControl');
    const getFormGroupSpy = spyOn(component, 'getFormGroup');
    const orderCountSpy = spyOn(component, 'orderCount').and.returnValue(13);
    const emitSpy = spyOn(component.changeMotion, 'emit');
    const animation = {
      type: null,
      duration: 100,
      delay: 50,
      order: 2,
      direction: PebMotionDirection.BottomToTop,
    };
    const buildIn = {
      initialValue: {
        type: PebBuildInAnimationType.Blur,
        direction: PebMotionDirection.TopToBottom,
        order: null,
      } as any,
      form: new FormGroup({
        type: new FormControl(PebBuildInAnimationType.Blur),
        direction: new FormControl(PebMotionDirection.TopToBottom),
        order: new FormControl(),
      }),
    };
    const action = {
      initialValue: {
        type: PebActionAnimationType.Move,
        direction: PebMotionDirection.TopToBottom,
        order: null,
      } as any,
      form: new FormGroup({
        type: new FormControl(PebActionAnimationType.Move),
        direction: new FormControl(PebMotionDirection.TopToBottom),
        order: new FormControl(),
      }),
    };
    const buildOut = {
      initialValue: {
        type: PebBuildOutAnimationType.Dissolve,
        direction: PebMotionDirection.TopToBottom,
        order: null,
      } as any,
      form: new FormGroup({
        type: new FormControl(PebBuildOutAnimationType.Dissolve),
        direction: new FormControl(PebMotionDirection.TopToBottom),
        order: new FormControl(),
      }),
    };

    component.buildIn = buildIn.initialValue;
    component.action = action.initialValue;
    component.buildOut = buildOut.initialValue;

    /**
     * type in argument animation is null
     * component.preAnimation returns null
     * component.getFormControl returns null
     */
    preSpy.and.returnValue(null);
    getControlSpy.and.returnValue(null);

    component.changeMotions(PebMotionType.Action, animation as any);

    expect(preSpy).toHaveBeenCalledOnceWith(PebMotionType.Action);
    expect(orderCountSpy).toHaveBeenCalledTimes(1);
    expect(getControlSpy).toHaveBeenCalledWith(MotionEffectType.Order, PebMotionType.Action);
    expect(getFormGroupSpy).not.toHaveBeenCalled();
    expect(animation.order).toBe(14);
    expect(animation.direction).toBeNull();
    expect(component.element.motion).toEqual({
      buildIn: buildIn.initialValue,
      action: action.initialValue,
      buildOut: buildOut.initialValue,
    });
    expect(emitSpy).toHaveBeenCalledWith(component.element.motion);

    /**
     * type in argument animation is PebBuildInAnimationType.Drift
     * component.preAnimation returns mocked data
     * component.getFormControl returns mocked control
     */
    preSpy.calls.reset();
    preSpy.and.returnValue({
      type: PebBuildInAnimationType.None,
      direction: PebMotionDirection.BottomToTop,
    } as any);
    animation.type = PebBuildInAnimationType.Drift;
    animation.direction = PebMotionDirection.RightToLeft;
    getControlSpy.and.returnValue(buildIn.form.get('order') as FormControl);

    component.changeMotions(PebMotionType.BuildIn, animation as any);

    expect(preSpy.calls.allArgs()).toEqual(Array(3).fill([PebMotionType.BuildIn]));
    expect(orderCountSpy).toHaveBeenCalledTimes(2);
    expect(animation.direction).toEqual(PebMotionDirection.RightToLeft);
    expect(getFormGroupSpy).not.toHaveBeenCalled();
    expect(buildIn.form.value.order).toBe(14);

    /**
     * component.preAnimation returns null
     * component.getFormGroup returns null
     */
    preSpy.calls.reset();
    preSpy.and.returnValue(null);
    getFormGroupSpy.and.returnValue(null);

    component.changeMotions(PebMotionType.BuildIn, animation as any);

    expect(getFormGroupSpy).toHaveBeenCalledOnceWith(PebMotionType.BuildIn);
    expect(animation.direction).toEqual(PebMotionDirection.LeftToRight);

    /**
     * component.getFormGroup returns mocked form group
     */
    getFormGroupSpy.and.returnValue(buildIn.form);

    component.changeMotions(PebMotionType.BuildIn, animation as any);

    expect(buildIn.form.value.direction).toEqual(PebMotionDirection.LeftToRight);

    /**
     * component.preAnimation returns mocked data with type prop as PebBuildInAnimationType.Dissolve
     */
    preSpy.and.returnValue({
      type: PebBuildInAnimationType.Dissolve,
      direction: PebMotionDirection.BottomToTop,
    } as any);
    getControlSpy.calls.reset();

    component.changeMotions(PebMotionType.BuildIn, animation as any);

    expect(getControlSpy).not.toHaveBeenCalled();

  });

  it('should get pre animation', () => {

    const motionMock: any = {
      buildIn: { type: PebBuildOutAnimationType.Blur },
      action: { type: PebActionAnimationType.Move },
      buildOut: { type: PebBuildOutAnimationType.Dissolve },
    };

    /**
     * component.element.motion is null
     */
    Object.values(PebMotionType).forEach((motionType) => {
      expect(component.preAnimation(motionType)).toBeUndefined();
    });

    /**
     * component.element.motion is set
     */
    component.element.motion = motionMock;
    expect(component.preAnimation(PebMotionType.BuildIn)).toEqual(motionMock.buildIn);
    expect(component.preAnimation(PebMotionType.Action)).toEqual(motionMock.action);
    expect(component.preAnimation(PebMotionType.BuildOut)).toEqual(motionMock.buildOut);

  });

  it('should get diff', () => {

    const oldMotion = {
      type: PebActionAnimationType.Blur,
      duration: 3000,
      delay: 500,
      order: 1,
    };
    const newMotion = { ...oldMotion };

    /**
     * there is no diff
     */
    expect(component.diff(oldMotion as any, newMotion as any)).toBe(false);

    /**
     * updated order property
     */
    newMotion.order = 5;

    expect(component.diff(oldMotion as any, newMotion as any)).toBe(true);

  });

});
