import { AnimationBuilder } from '@angular/animations';
import { Component } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { of, Subscription } from 'rxjs';

import {
  PebBuildInAnimationType,
  PebBuildOutAnimationType,
  PebElementType,
  PebMotionType,
} from '@pe/builder-core';

import { createAnimation, createRestoreAnimation } from '../../animations/animations';

import { PebAbstractStyledElement } from './abstract.styled-element';

@Component({
  selector: '',
  template: '',
})
class TestComponent extends PebAbstractStyledElement {

  get elements() { return {}; }

  get mappedStyles() { return {}; }

}

describe('PebAbstractStyledElement', () => {

  let fixture: ComponentFixture<PebAbstractStyledElement>;
  let component: PebAbstractStyledElement;
  let animationBuilder: jasmine.SpyObj<AnimationBuilder>;

  beforeEach(waitForAsync(() => {

    const animationBuilderSpy = jasmine.createSpyObj<AnimationBuilder>('AnimationBuilder', ['build']);

    TestBed.configureTestingModule({
      declarations: [TestComponent],
      providers: [
        { provide: AnimationBuilder, useValue: animationBuilderSpy },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(TestComponent);
      component = fixture.componentInstance;

      animationBuilder = TestBed.inject(AnimationBuilder) as jasmine.SpyObj<AnimationBuilder>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get content container', () => {

    const getSpy = spyOnProperty(component, 'nativeElement').and.callThrough();

    expect(component.contentContainer).toEqual(fixture.nativeElement);
    expect(getSpy).toHaveBeenCalled();

  });

  it('should apply styles', () => {

    const elementsSpy = spyOnProperty<any>(component, 'elements').and.returnValue(null);
    const warnSpy = spyOn(console, 'warn');
    const setStyleSpy = spyOn(component[`renderer`], 'setStyle');
    const wrapperCmp = {
      instance: {
        applyStyles: jasmine.createSpy('applyStyles'),
      },
    };
    const hostElem = fixture.nativeElement as HTMLElement;
    const elements = {
      host: hostElem,
      paragraphs: Array.from({ length: 2 }, () => document.createElement('p')),
      noMappedStyles: document.createElement('span'),
      noElem: null,
    };
    const mappedStyles = {
      host: { backgroundColor: '#333333' },
      paragraphs: { color: '#ffffff' },
    };

    hostElem.style.backgroundColor = '#454545';
    hostElem.style.fontSize = '32px';
    spyOnProperty<any>(component, 'mappedStyles').and.returnValue(mappedStyles);

    /**
     * component.elements is null
     */
    expect(elementsSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith('Invalid element component. Missing "elements()" declaration');
    expect(setStyleSpy).not.toHaveBeenCalled();

    /**
     * component.elements is set
     * component.wrapperCmp is null
     */
    elementsSpy.and.returnValue(elements);
    warnSpy.calls.reset();

    component.wrapperCmp = null;

    expect(warnSpy).not.toHaveBeenCalled();
    expect(setStyleSpy.calls.allArgs()).toEqual([
      [hostElem, 'backgroundColor', '#333333'],
      ...elements.paragraphs.map(p => [p, 'color', '#ffffff']) as any[],
    ]);
    expect(hostElem.style.fontSize).toEqual('');

    /**
     * component.wrapperCmp is set
     */
    component.wrapperCmp = wrapperCmp as any;

    expect(wrapperCmp.instance.applyStyles).toHaveBeenCalled();

  });

  it('should apply animation', fakeAsync(() => {

    const animation = {
      type: PebBuildInAnimationType.Dissolve,
      duration: 1.5,
      delay: .5,
    };
    const mappedStyles = {
      host: null,
    };
    const player = {
      startCallback: null,
      onStart: jasmine.createSpy('onStart').and.callFake((callback: Function) => {
        player.startCallback = callback;
      }),
      doneCallback: null,
      onDone: jasmine.createSpy('onDone').and.callFake((callback: Function) => {
        player.doneCallback = callback;
      }),
      play: jasmine.createSpy('play').and.callFake(() => {
        player.startCallback();
        setTimeout(() => player.doneCallback(), 100);
      }),
    };
    const animationFactory = {
      create: jasmine.createSpy('create').and.returnValue(player),
    };
    let sub: Subscription;

    spyOnProperty<any>(component, 'mappedStyles').and.returnValue(mappedStyles);
    animationBuilder.build.and.returnValue(animationFactory);

    /**
     * argument restore is FALSE as default
     * argument animationType is animation.type as default
     * argument duration is animation.duration as default
     * component.mappedStyles.host is null
     */
    sub = component.applyAnimation(animation as any, PebMotionType.BuildIn).subscribe();

    expect(animationBuilder.build).toHaveBeenCalledWith([
      ...createAnimation(animation as any, PebMotionType.BuildIn, {}),
    ]);
    expect(animationFactory.create).toHaveBeenCalledWith(fixture.nativeElement);
    expect(player.onStart).toHaveBeenCalledWith(player.startCallback);
    expect(player.onDone).toHaveBeenCalledWith(player.doneCallback);
    expect(player.play).toHaveBeenCalled();
    expect(component[`animationPlayer`]).toEqual(player as any);
    expect(sub.closed).toBe(false);

    tick(100);

    expect(component[`animationPlayer`]).toBeNull();
    expect(sub.closed).toBe(true);

    sub.unsubscribe();

    /**
     * arguments restore, animationType & duration are set
     * component.mappedStyles.host is set
     */
    mappedStyles.host = { opacity: .5 };

    sub = component.applyAnimation(animation as any, PebMotionType.BuildOut, {
      restore: true,
      animationType: PebBuildOutAnimationType.Dissolve,
      duration: 2,
    }).subscribe();

    expect(animationBuilder.build).toHaveBeenCalledWith([
      ...createAnimation(
        {
          ...animation,
          duration: 2,
          type: PebBuildOutAnimationType.Dissolve,
        } as any,
        PebMotionType.BuildOut,
        mappedStyles.host,
      ),
      ...createRestoreAnimation({
        ...animation,
        duration: 2,
        type: PebBuildOutAnimationType.Dissolve,
      } as any),
    ]);
    expect(component[`animationPlayer`]).toEqual(player as any);
    expect(sub.closed).toBe(false);

    tick(100);

    expect(component[`animationPlayer`]).toBeNull();
    expect(sub.closed).toBe(true);

    sub.unsubscribe();

  }));

  it('should apply build in animation', () => {

    const applied: any = { test: 'animation.applied' };
    const applySpy = spyOn(component, 'applyAnimation').and.returnValue(of(applied));
    const animation: any = {
      type: PebBuildInAnimationType.Blur,
      duration: 1,
    };

    /**
     * component.element.motion is null
     */
    component.element = {
      id: 'elem',
      type: PebElementType.Shape,
      motion: null,
    };
    component.applyBuildInAnimation().subscribe(res => expect(res).toBeUndefined()).unsubscribe();

    expect(applySpy).not.toHaveBeenCalled();

    /**
     * component.element.motion.buildIn is set
     */
    component.element.motion = {
      buildIn: animation,
    } as any;
    component.applyBuildInAnimation().subscribe(res => expect(res).toEqual(applied)).unsubscribe();

    expect(applySpy).toHaveBeenCalledWith(
      animation,
      PebMotionType.BuildIn,
    );

  });

  it('should apply build out animation', () => {

    const applied: any = { test: 'animation.applied' };
    const applySpy = spyOn(component, 'applyAnimation').and.returnValue(of(applied));
    const animation: any = {
      type: PebBuildOutAnimationType.Blur,
      duration: 1,
    };

    /**
     * component.element.motion is null
     */
    component.element = {
      id: 'elem',
      type: PebElementType.Shape,
      motion: null,
    };
    component.applyBuildOutAnimation().subscribe(res => expect(res).toBeUndefined()).unsubscribe();

    expect(applySpy).not.toHaveBeenCalled();

    /**
     * component.element.motion.buildOut is set
     */
    component.element.motion = {
      buildOut: animation,
    } as any;
    component.applyBuildOutAnimation().subscribe(res => expect(res).toEqual(applied)).unsubscribe();

    expect(applySpy).toHaveBeenCalledWith(
      animation,
      PebMotionType.BuildOut,
    );

  });

});
