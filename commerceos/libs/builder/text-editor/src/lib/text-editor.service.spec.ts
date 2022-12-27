import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { count, take } from 'rxjs/operators';

import { PebInteractionType, PebTextJustify } from '@pe/builder-core';

import { TextEditorCommand } from './text-editor.interface';
import { PebTextEditorService, toNumber } from './text-editor.service';

describe('PebTextEditorService', () => {

  let service: PebTextEditorService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [PebTextEditorService],
    });

    service = TestBed.inject(PebTextEditorService);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get limits', () => {

    const elCmp = {
      getMakerMaxPossibleDimensions: jasmine.createSpy('getMakerMaxPossibleDimensions')
        .and.returnValue({ width: 1200, height: 500 }),
      styles: {
        maxWidth: 1000,
        padding: '10px',
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 10,
      },
    };
    const dimensions = {
      width: 1500,
      height: 700,
    };
    let subscription: Subscription;

    // w/ padding = 10px
    // typeof maxWidth = number
    subscription = service.limits$.subscribe(limits => expect(limits).toEqual({
      width: 980,
      height: 480,
    }));

    service.selectElement(elCmp);
    service.setDimensions(dimensions);

    subscription.unsubscribe();

    // padding = 10px 20px
    // typeof maxWidth = string
    elCmp.styles = {
      maxWidth: '1000px' as any,
      padding: '10px 20px',
      paddingTop: 10,
      paddingRight: 20,
      paddingBottom: 10,
      paddingLeft: 20,
    };

    subscription = service.limits$.subscribe(limits => expect(limits).toEqual({
      width: 960,
      height: 480,
    }));

    service.selectElement(elCmp);
    service.setDimensions(dimensions);

    subscription.unsubscribe();

    // padding = 10px 20px 5px 5px
    // w/o maxWidth
    elCmp.styles = {
      maxWidth: undefined,
      padding: '10px 20px 5px 5px',
      paddingTop: 10,
      paddingRight: 20,
      paddingBottom: 5,
      paddingLeft: 5,
    };

    subscription = service.limits$.subscribe(limits => expect(limits).toEqual({
      width: 1175,
      height: 485,
    }));

    service.selectElement(elCmp);
    service.setDimensions(dimensions);

    subscription.unsubscribe();

    // w/o padding
    elCmp.styles = {
      ...elCmp.styles,
      padding: undefined,
    };

    subscription = service.limits$.subscribe(limits => expect(limits).toEqual({
      width: 1175,
      height: 485,
    }));

    service.selectElement(elCmp);
    service.setDimensions(dimensions);

    subscription.unsubscribe();

    // w/o all paddings
    elCmp.styles = {
      ...elCmp.styles,
      paddingTop: undefined,
      paddingRight: undefined,
      paddingBottom: undefined,
      paddingLeft: undefined,
    };

    subscription = service.limits$.subscribe(limits => expect(limits).toEqual({
      width: 1200,
      height: 500,
    }));

    service.selectElement(elCmp);
    service.setDimensions(dimensions);

    subscription.unsubscribe();

  });

  it('should set selected element', () => {

    const nextSpy = spyOn(service[`selectedElement$`], 'next');
    const elCmp = { test: true };

    service.selectElement(elCmp);

    expect(nextSpy).toHaveBeenCalledWith(elCmp);

  });

  it('should set/get content', () => {

    const nextSpy = spyOn(service[`contentSubject$`], 'next').and.callThrough();
    const value = 'test';
    const elCmp = { test: true };

    service.content$.subscribe(content => expect(content).toEqual(value));

    service.selectElement(elCmp);
    service.setContent(value);

    expect(nextSpy).toHaveBeenCalledWith(value);

  });

  it('should set/get selection', () => {

    const nextSpy = spyOn(service.selection$, 'next').and.callThrough();
    const value = { index: 0, length: 2 };

    service.selection$.subscribe(selection => expect(selection).toEqual(value));

    service.setSelection(value);

    expect(nextSpy).toHaveBeenCalled();

  });

  it('should set/get dimensions', () => {

    const nextSpy = spyOn(service[`dimensionsSubject$`], 'next').and.callThrough();
    const value = {
      width: 1500,
      height: 700,
    };
    const elCmp = { test: true };

    service.dimensions$.subscribe(dimensions => expect(dimensions).toEqual(value));

    service.selectElement(elCmp);
    service.setDimensions(value);

    expect(nextSpy).toHaveBeenCalledWith(value);

  });

  it('should set styles', () => {

    const nextSpy = spyOn(service[`styles$`], 'next');
    const styles = { color: '#333333' };

    service.setStyles(styles as any);

    expect(nextSpy).toHaveBeenCalledWith(styles as any);

  });

  it('should set undo stack', () => {

    const stackMock = [{ test: 'undo' }];

    service.canUndo$.pipe(
      take(2),
      count((value, index) => {
        if (index === 0) {
          expect(value).toBe(false);
          expect(service[`undoStackSubject$`].value).toEqual([]);
        } else {
          expect(value).toBe(true);
          expect(service[`undoStackSubject$`].value).toEqual(stackMock);
        }

        return true;
      }),
    ).subscribe();

    service.setUndoStack(stackMock);

  });

  it('should set redo stack', () => {

    const stackMock = [{ test: 'redo' }];

    service.canRedo$.pipe(
      take(2),
      count((value, index) => {
        if (index === 0) {
          expect(value).toBe(false);
          expect(service[`redoStackSubject$`].value).toEqual([]);
        } else {
          expect(value).toBe(true);
          expect(service[`redoStackSubject$`].value).toEqual(stackMock);
        }

        return true;
      }),
    ).subscribe();

    service.setRedoStack(stackMock);

  });

  it('should dispatch command', () => {

    const nextSpy = spyOn(service.execCommand$, 'next');
    const cmd = TextEditorCommand.color;
    const payload = '#333333';

    service.dispatch(cmd, payload);

    expect(nextSpy).toHaveBeenCalledWith([cmd, payload]);

  });

  it('should apply styles', () => {

    const dispatchSpy = spyOn(service, 'dispatch');
    const styles = {
      link: {
        type: PebInteractionType.NavigateInternal,
        payload: 'url/internal',
      },
      fontFamily: 'Montserrat',
      fontWeight: 700,
      fontSize: 32,
      color: '#333333',
      italic: false,
      underline: false,
      strike: false,
      textJustify: PebTextJustify.Left,
    };

    /**
     * styles.textJustify is PebTextJustify.Left
     */
    service.applyStyles(styles);

    expect(dispatchSpy.calls.allArgs()).toEqual(Object.entries(styles).map(([key, value]) => {
      return [
        TextEditorCommand[key === 'textJustify' ? 'justify' : key],
        value === PebTextJustify.Left ? false : value,
      ];
    }));

    /**
     * styles.textJustify is PebTextJustify.Left
     */
    dispatchSpy.calls.reset();

    service.applyStyles({ textJustify: PebTextJustify.Justify });

    expect(dispatchSpy).toHaveBeenCalledOnceWith(TextEditorCommand.justify, PebTextJustify.Justify);

  });

  it('should convert to number', () => {

    expect(toNumber(10)).toBe(10);
    expect(toNumber('13px')).toBe(13);

  });

});
