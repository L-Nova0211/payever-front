import { AnimationBuilder } from '@angular/animations';
import { Component, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import Delta from 'quill-delta';
import { of } from 'rxjs';

import {
  PebActionAnimationType,
  PebBuildInAnimationType,
  PebBuildOutAnimationType,
  PebElementType,
  PebFunctionType,
  PebIntegrationActionTag,
  PebIntegrationDataType,
  PebInteractionType,
  PebLanguage,
  PebMotionEvent,
  PebMotionEventType,
  PebMotionType,
  PebScreen,
  PebTextJustify,
} from '@pe/builder-core';
import { AppType, APP_TYPE } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';

import {
  RENDERER_GET_CONTEXT,
  RENDERER_GET_STYLESHEET,
  RENDERER_INTERACTION_EMITTER,
} from '../../renderer.tokens';
import * as utils from '../../utils';

import { PebAbstractElement } from './abstract.element';


@Component({
  selector: '',
  template: '',
})
class TestComponent extends PebAbstractElement {

  get elements() {
    return {};
  }

  get mappedStyles() {
    return {};
  }

}

describe('PebAbstractElement', () => {

  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  const getParentSpy = jasmine.createSpy('getParent');
  const getStylesheetSpy = jasmine.createSpy('getStylesheet');
  const getContextSpy = jasmine.createSpy('getContext');
  const getFactoriesSpy = jasmine.createSpy('getFactories');
  const getChildrenSpy = jasmine.createSpy('getChildren');
  const translateService: any = { test: 'translate.service' };

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [TestComponent],
      providers: [
        { provide: AnimationBuilder, useValue: {} },
        { provide: TranslateService, useValue: translateService },
        { provide: RENDERER_GET_STYLESHEET, useValue: getStylesheetSpy },
        { provide: RENDERER_GET_CONTEXT, useValue: getContextSpy },
        { provide: APP_TYPE, useValue: AppType.Shop },
        { provide: RENDERER_INTERACTION_EMITTER, useValue: new EventEmitter<any>() },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(TestComponent);
      component = fixture.componentInstance;
      component.element = {
        id: 'elem',
        type: PebElementType.Shape,
        data: {
          functionLink: {
            functionType: PebFunctionType.SelectLink,
            title: 'function.link.title',
            integration: {
              id: 'i-001',
              title: 'integration.title',
            },
          } as any,
        },
        motion: null,
        parent: null,
      };
      component.options = {
        scale: 1,
        screen: PebScreen.Desktop,
        locale: PebLanguage.English,
        interactions: false,
      };

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle click', () => {

    const host: HTMLElement = fixture.nativeElement;
    const applySpy = spyOn(component, 'applyAnimation');
    const click = new MouseEvent('click');

    /**
     * component.element.motion is null
     */
    component.options.interactions = true;

    host.dispatchEvent(click);

    expect(applySpy).not.toHaveBeenCalled();

    /**
     * component.element.motion.buldIn is null
     */
    component.element.motion = {
      buildIn: null,
    } as any;

    host.dispatchEvent(click);

    expect(applySpy).not.toHaveBeenCalled();

    /**
     * component.element.motion.buildIn.event is PebMotionEvent.OnClick
     */
    component.element.motion.buildIn = {
      event: PebMotionEvent.OnClick,
    } as any;

    host.dispatchEvent(click);

    expect(applySpy).toHaveBeenCalledWith(
      component.element.motion.buildIn,
      PebMotionType.BuildIn,
    );

  });

  it('should set animation observables on construct', () => {

    const applySpy = spyOn(component, 'applyAnimation').and.returnValue(of(null));
    const stateSubject = component[`actionAnimationStateSubject$`];
    const checkSubject = component[`checkActionAnimationState$`];

    /**
     * component.options is null
     */
    stateSubject.next('in');

    expect(applySpy).not.toHaveBeenCalled();

    /**
     * component.options.interactions is TRUE
     * component.element.motion is null
     */
    component.options = {
      ...component.options,
      interactions: true,
    };
    stateSubject.next('out');

    expect(applySpy).not.toHaveBeenCalled();

    /**
     * component.element.motion.type is 'test'
     */
    component.element.motion = {
      action: {
        type: 'test',
        duration: 500,
      },
    } as any;
    stateSubject.next('in');

    expect(applySpy).not.toHaveBeenCalled();

    /**
     * component.element.motion.action.type is PebActionAnimationType.None
     */
    component.element.motion.action.type = PebActionAnimationType.None;
    stateSubject.next('out');

    expect(applySpy).not.toHaveBeenCalled();

    /**
     * component.element.motion.action.type is PebActionAnimationType.Blur
     */
    component.element.motion.action.type = PebActionAnimationType.Blur;
    stateSubject.next('in');

    expect(applySpy).toHaveBeenCalledOnceWith(
      {
        type: PebBuildInAnimationType.Blur,
        duration: 500,
      } as any,
      PebMotionType.BuildIn,
      { duration: 0 },
    );

    /**
     * emit state as 'out'
     */
    stateSubject.next('out');

    expect(applySpy).toHaveBeenCalledWith(
      {
        type: PebBuildOutAnimationType.Blur,
        duration: 500,
      } as any,
      PebMotionType.BuildOut,
      { duration: 500 },
    );

    /**
     * check action animation state
     * component.options is null
     * component.element.motion is null
     */
    const nextSpy = spyOn(stateSubject, 'next');

    component.options = null;
    component.element.motion = null;
    checkSubject.next();

    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * component.options.interactions is TRUE
     */
    component.options = {
      ...component.options,
      interactions: true,
    };
    checkSubject.next();

    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * component.element.motion.action.eventType is
     */
    getContextSpy.and.returnValue({});
    component.element.motion = {
      action: {
        event: PebMotionEvent.OnClick,
        eventType: PebMotionEventType.BasketFill,
      },
    } as any;
    checkSubject.next();

    expect(nextSpy).toHaveBeenCalledWith('out');

  });

  it('should get parent', () => {

    const parent: any = { id: 'parent' };

    getParentSpy.and.returnValue(parent);

    expect(component.parent).toEqual(parent);
    expect(getParentSpy).toHaveBeenCalled();

  });

  it('should get renderer stylesheet', () => {

    const stylesheet = {
      elem: { color: '#333333' },
    };

    getStylesheetSpy.and.returnValue(stylesheet);

    expect(component.rendererStylesheet).toEqual(stylesheet);
    expect(getStylesheetSpy).toHaveBeenCalled();

  });

  it('should get renderer context', () => {

    const context = {
      elem: { test: 'elem.context' },
    };

    getContextSpy.and.returnValue(context);

    expect(component.rendererContext).toEqual(context);
    expect(getContextSpy).toHaveBeenCalled();

  });

  it('should get element factories', () => {

    const factories = {
      [PebElementType.Shape]: () => null,
    };

    getFactoriesSpy.and.returnValue(factories);

    expect(getFactoriesSpy).toHaveBeenCalled();

  });

  it('should get children', () => {

    const children: any[] = [{ id: 'child' }];

    getChildrenSpy.and.returnValue(children);

    expect(component.children).toEqual(children);
    expect(getChildrenSpy).toHaveBeenCalledWith(component);

  });

  it('should check is parent', () => {

    expect(component.isParent).toBe(false);

    component.element.type = PebElementType.Section;
    expect(component.isParent).toBe(true);

  });

  it('should get is mail view', () => {

    /**
     * component.appType is AppType.Shop
     */
    expect(component.isMailView).toBe(false);

    /**
     * component.appType is AppType.Mail
     */
    component[`appType`] = AppType.Mail;
    expect(component.isMailView).toBe(true);

  });

  it('should detect changes', () => {

    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const wrapperCmp = {
      instance: {
        cdr: null,
      },
    };

    /**
     * component.wrapperCmp is null
     */
    component.wrapperCmp = null;
    component.detectChanges();

    expect(detectSpy).toHaveBeenCalled();

    /**
     * component.wrapperCmp.instance.cdr is null
     */
    component.wrapperCmp = wrapperCmp as any;
    component.detectChanges();

    expect(detectSpy).toHaveBeenCalledTimes(2);

    /**
     * component.wrapperCmp.instance.cdr is set
     */
    wrapperCmp.instance.cdr = { detectChanges: jasmine.createSpy('detectChanges') };
    component.detectChanges();

    expect(detectSpy).toHaveBeenCalledTimes(3);
    expect(wrapperCmp.instance.cdr.detectChanges).toHaveBeenCalledTimes(1);

  });

  it('should get text content', () => {

    const integrationText = 'test - integration';

    spyOnProperty(component, 'integrationText').and.returnValue(integrationText);

    /**
     * component.element.type is PebElementType.Shape
     * component.element.data is null
     */
    component.options.screen = PebScreen.Mobile;
    component.element.data = null;
    expect(component.getTextContent()).toEqual(new Delta([
      { insert: '' },
      { insert: '\n' },
    ]));

    /**
     * component.element.data.text is {}
     */
    component.element.data = {
      text: {},
    };
    expect(component.getTextContent()).toEqual(new Delta([
      { insert: '' },
      { insert: '\n' },
    ]));

    /**
     * component.element.data.text[PebScreen.Desktop] is {}
     */
    component.element.data.text[PebScreen.Desktop] = {};
    expect(component.getTextContent()).toEqual(new Delta([
      { insert: '' },
      { insert: '\n' },
    ]));

    /**
     * component.element.data.text[PebScreen.Desktop][component.options.locale] is set
     */
    component.element.data.text[PebScreen.Desktop] = {
      [component.options.locale]: new Delta([{ insert: 'test.options.locale' }]),
    };
    expect(component.getTextContent()).toEqual(new Delta([{ insert: 'test.options.locale' }]));

    /**
     * component.element.data.text[component.options.screen][PebLanguage.Generic] is set
     */
    component.element.data.text[component.options.screen] = {
      [PebLanguage.Generic]: new Delta([{ insert: 'test.mobile.generic' }]),
    };
    expect(component.getTextContent()).toEqual(new Delta([{ insert: 'test.mobile.generic' }]));

    /**
     * component.element.data.text[component.options.screen][component.options.locale] is set
     */
    component.element.data.text[component.options.screen] = {
      [component.options.locale]: new Delta([{ insert: 'test.mobile.english' }]),
    };
    expect(component.getTextContent()).toEqual(new Delta([{ insert: 'test.mobile.english' }]));

    /**
     * component.element.data.text is null
     * component.element.data.functionLink is set
     * component.element.data.functionLink.dataType is PebIntegrationDataType.Input
     */
    component.element.data.text = null;
    component.element.data.functionLink = {
      functionType: PebFunctionType.Data,
      dataType: PebIntegrationDataType.Input,
      integration: { id: 'i-001' },
    } as any;
    expect(component.getTextContent()).toEqual(new Delta([
      { insert: '' },
      { insert: '\n' },
    ]));

    /**
     * component.element.data.functionLink.dataType is PebIntegrationDataType.Text
     */
    component.element.data.functionLink['dataType'] = PebIntegrationDataType.Text;
    expect(component.getTextContent()).toEqual(new Delta([
      { insert: integrationText, attributes: {} },
      { insert: '\n' },
    ]));

    /**
     * text is set as empty Delta
     */
    component.element.data.text = {
      [PebScreen.Desktop]: {
        [component.options.locale]: new Delta(),
      },
    };
    expect(component.getTextContent()).toEqual(new Delta([
      { insert: integrationText, attributes: {} },
      { insert: '\n' },
    ]));

    /**
     * text is set as mocked Delta
     */
    component.element.data.text[PebScreen.Desktop] = {
      [component.options.locale]: new Delta([
        { insert: '', attributes: { color: '#333333' } },
        { insert: 'test', attributes: { align: PebTextJustify.Center } },
      ]),
    };
    expect(component.getTextContent()).toEqual(new Delta([
      { insert: integrationText, attributes: { color: '#333333', align: PebTextJustify.Center } },
      { insert: '\n', attributes: { align: PebTextJustify.Center } },
    ]));

    /**
     * component.element.type is PebElementType.GridCellCategory
     * component.element.parent is null
     * component.element.data.functionLink.functionType is null
     */
    component.element.type = PebElementType.GridCellCategory;
    component.element.data.functionLink = null;
    component.context = {
      data: { name: 'test.context' },
    } as any;
    expect(component.getTextContent()).toEqual(new Delta([
      { insert: component.context.data.name, attributes: {} },
      { insert: '\n' },
    ]));

    /**
     * component.element.parent.data is null
     */
    component.element.parent = { data: null } as any;
    expect(component.getTextContent()).toEqual(new Delta([
      { insert: component.context.data.name, attributes: {} },
      { insert: '\n' },
    ]));

    /**
     * text is set as empty Delta
     */
    component.element.parent = {
      data: {
        text: {
          [PebScreen.Desktop]: {
            [component.options.locale]: new Delta(),
          },
        },
      },
    } as any;
    expect(component.getTextContent()).toEqual(new Delta([
      { insert: component.context.data.name, attributes: {} },
      { insert: '\n' },
    ]));

    /**
     * text is set as mocked Delta
     */
    component.element.parent = {
      data: {
        text: {
          [PebScreen.Desktop]: {
            [component.options.locale]: new Delta([{
              insert: 'test',
              attributes: {
                color: '#333333',
                align: PebTextJustify.Justify,
              },
            }]),
          },
        },
      },
    } as any;
    expect(component.getTextContent()).toEqual(new Delta([
      {
        insert: component.context.data.name,
        attributes: {
          color: '#333333',
          align: PebTextJustify.Justify,
        },
      },
      { insert: '\n', attributes: { align: PebTextJustify.Justify } },
    ]));

    /**
     * component.element.type is PebElementType.Grid
     * component.element.data is null
     */
    component.element.type = PebElementType.Grid;
    component.element.data = null;
    expect(component.getTextContent()).toEqual(new Delta([
      { insert: '' },
      { insert: '\n' },
    ]));

    /**
     * component.element.data.functionLink is set
     * component.element.data.functionLink.tags is null
     */
    component.element.data = {
      functionLink: {
        functionType: PebFunctionType.Action,
        tags: null,
      },
    } as any;
    expect(component.getTextContent()).toEqual(new Delta([
      { insert: '' },
      { insert: '\n' },
    ]));

    /**
     * component.element.data.functionLink.tags is set
     */
    component.element.data.functionLink['tags'] = [PebIntegrationActionTag.GetCategoriesByProducts];
    component.element.data.text = {
      [PebScreen.Desktop]: {
        [component.options.locale]: new Delta([{
          insert: 'test',
          attributes: {
            fontSize: 32,
            textJustify: PebTextJustify.Right,
          },
        }]),
      },
    };
    expect(component.getTextContent()).toEqual(new Delta([{
      attributes: {
        fontSize: 32,
        align: PebTextJustify.Right,
      },
    }]));

  });

  it('should get integration text', () => {

    const translateSpy = spyOn<any>(component, 'translate').and.returnValue('translated');

    /**
     * component.element.data.functionLink.functionType is PebFunctionType.SelectLink
     */
    expect(component.integrationText).toEqual('');
    expect(translateSpy).not.toHaveBeenCalled();

    /**
     * component.element.data.functionLink.functionType is PebFunctionType.Data
     */
    component.element.data.functionLink.functionType = PebFunctionType.Data;
    expect(component.integrationText).toEqual('integration.title - translated');
    expect(translateSpy).toHaveBeenCalledWith(component.element.data.functionLink.title);

  });

  it('should apply styles', () => {

    const elementsSpy = spyOnProperty(component, 'elements').and.returnValues(null);
    const warnSpy = spyOn(console, 'warn');
    const setStyleSpy = spyOn(component[`renderer`], 'setStyle');
    const nativeElem = document.createElement('div');
    const elements = {
      host: fixture.nativeElement,
    };

    spyOnProperty(component, 'contentContainer').and.returnValue(nativeElem);

    /**
     * component.elements is null
     */

    expect(elementsSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith('Invalid element component. Missing "elements()" declaration');
    expect(setStyleSpy).not.toHaveBeenCalled();

    /**
     * component.elements is set
     * component.element.data is null
     */
    elementsSpy.and.returnValue(elements);
    warnSpy.calls.reset();

    component.element.data = null;

    expect(warnSpy).not.toHaveBeenCalled();
    expect(setStyleSpy).not.toHaveBeenCalled();

    /**
     * component.element.data.devGrid is set
     * component.element.data.devGridStep is null
     */
    component.element.data = {
      devGrid: true,
      devGridStep: null,
    };
    expect(setStyleSpy.calls.allArgs()).toEqual([
      [nativeElem, 'backgroundColor', '#f8f8f8'],
      [
        nativeElem,
        'backgroundImage',
        'linear-gradient(to right, rgba(194, 194, 194, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(194, 194, 194, 0.2) 1px, transparent 1px)',
      ],
      [nativeElem, 'backgroundSize', '50px 50px, 50px 50px'],
      [nativeElem, 'backgroundPosition', '-1px -1px, -1px -1px'],
    ]);

    /**
     * component.element.data.devGridStep is set
     */
    setStyleSpy.calls.reset();

    component.element.data.devGridStep = 100;

    expect(setStyleSpy.calls.allArgs()[2]).toEqual([nativeElem, 'backgroundSize', '100px 100px, 100px 100px']);

  });

  it('should check action animation state', () => {

    const nextSpy = spyOn(component[`checkActionAnimationState$`], 'next');

    component.checkActionAnimationState();

    expect(nextSpy).toHaveBeenCalled();

  });

  it('should interact', () => {

    const emitSpy = spyOn(component[`interactionEmitter`], 'emit');
    const interaction = {
      type: PebInteractionType.CartClick,
      payload: null,
    };

    component.interact(interaction);

    expect(emitSpy).toHaveBeenCalledWith(interaction);

  });

  it('should subscribe for specific interaction', () => {

    const interaction = {
      type: PebInteractionType.CartClick,
      payload: null,
    };

    component.interactionSubscription(interaction.type).subscribe(res => expect(res).toEqual(interaction));
    component.interact(interaction);

  });

  it('should check required styles', () => {

    const warnSpy = spyOn(console, 'warn');

    /**
     * component.element.type is PebElementType.Shape
     */
    component[`checkRequiredStyles`]();

    expect(warnSpy).not.toHaveBeenCalled();

    /**
     * component.element.type is PebElementType.Image
     * only width set in component.styles
     */
    component.styles = { width: 1000 };
    component[`checkRequiredStyles`]();

    expect(warnSpy).toHaveBeenCalledTimes(1);

  });

  it('should translate', () => {

    Object.defineProperty(utils, 'rendererTranslate', {
      value: utils.rendererTranslate,
      writable: true,
    });

    const translateSpy = spyOn(utils, 'rendererTranslate').and.returnValue('translated');

    expect(component[`translate`]('test')).toEqual('translated');
    expect(translateSpy).toHaveBeenCalledWith('test', component.options, translateService);

  });

});
