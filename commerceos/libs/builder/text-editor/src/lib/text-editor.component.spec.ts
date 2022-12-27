import { EventEmitter, Renderer2, SimpleChange } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import * as pebCore from '@pe/builder-core';
import {
  PebEditorState,
  PebInteractionType,
  PebTextAlignType,
  PebTextJustify,
  PebTextVerticalAlign,
  PEB_DEFAULT_FONT_COLOR,
  PEB_DEFAULT_FONT_FAMILY,
  PEB_DEFAULT_FONT_SIZE,
  PEB_DEFAULT_LINK_COLOR,
} from '@pe/builder-core';
import * as pebRenderer from '@pe/builder-renderer';
import { omit } from 'lodash';
import Delta from 'quill-delta';
import { of, Subject } from 'rxjs';
import * as rxjsOps from 'rxjs/operators';
import { count, filter, map, take, tap } from 'rxjs/operators';
import * as quill from './quill';
import { PebTextEditor } from './text-editor.component';
import { PEB_DEFAULT_TEXT_STYLE, TextEditorCommand } from './text-editor.interface';
import { PebTextEditorService } from './text-editor.service';

describe('PebTextEditor', () => {

  let fixture: ComponentFixture<PebTextEditor>;
  let component: PebTextEditor;
  let textEditorService: jasmine.SpyObj<PebTextEditorService>;
  let sanitizer: jasmine.SpyObj<DomSanitizer>;
  let renderer: jasmine.SpyObj<Renderer2>;

  beforeAll(() => {

    Object.defineProperty(quill, 'default', {
      value: quill.default,
      writable: true,
    });

    Object.defineProperty(pebRenderer, 'fromResizeObserver', {
      value: pebRenderer.fromResizeObserver,
      writable: true,
    });

    Object.defineProperty(rxjsOps, 'throttleTime', {
      value: rxjsOps.throttleTime,
      writable: true,
    });

    Object.defineProperty(pebCore, 'getContentDimensions', {
      value: pebCore.getContentDimensions,
      writable: true,
    });

  });

  beforeEach(waitForAsync(() => {

    const textEditorServiceSpy = jasmine.createSpyObj<PebTextEditorService>('PebTextEditorService', [
      'setRedoStack',
      'setUndoStack',
      'setStyles',
      'setDimensions',
    ], {
      limits$: new Subject<{ width: number; height: number; }>(),
      execCommand$: new Subject<[TextEditorCommand, any]>(),
      selection$: new Subject<{ index: number; length: number; }>(),
    });

    const sanitizerSpy = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', {
      bypassSecurityTrustHtml: 'bypassed.html',
      bypassSecurityTrustStyle: 'color:#333333',
    });

    renderer = jasmine.createSpyObj<Renderer2>('Renderer2', ['setStyle']);

    TestBed.configureTestingModule({
      declarations: [PebTextEditor],
      providers: [
        { provide: PebTextEditorService, useValue: textEditorServiceSpy },
        { provide: PebEditorState, useValue: {} },
        { provide: DomSanitizer, useValue: sanitizerSpy },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebTextEditor);
      component = fixture.componentInstance;
      component[`renderer`] = renderer;
      component.document = document;
      component.text = new Delta([{ insert: '' }]);

      textEditorService = TestBed.inject(PebTextEditorService) as jasmine.SpyObj<PebTextEditorService>;
      sanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set enabled', () => {

    const nextSpy = spyOn(component.enabled$, 'next');

    component.enabled = true;
    expect(component[`isEnabled`]).toBe(true);
    expect(nextSpy).toHaveBeenCalledWith(true);

    component.enabled = null;
    expect(component[`isEnabled`]).toBe(false);
    expect(nextSpy).toHaveBeenCalledWith(false);

  });

  it('should set maxWidth$', () => {

    component.maxWidth$.pipe(
      take(3),
      count((value, index) => {
        switch (index) {
          case 0:
            expect(value).toEqual(`${component.quillContainer.nativeElement.getBoundingClientRect().width}px`);
            break;
          case 1:
            expect(value).toEqual('100%');
            break;
          case 2:
            expect(value).toEqual('1200px');
            break;
        }
        return true;
      }),
    ).subscribe();

    /**
     * component.autoSize.width is FALSE
     */
    component.autosize.width = false;
    (textEditorService.limits$ as Subject<any>).next({
      width: 1200,
      height: 500,
    });

    /**
     * component.autoSize.width is TRUE
     * emitted width is null
     */
    component.autosize.width = true;
    (textEditorService.limits$ as Subject<any>).next({
      width: null,
      height: 500,
    });

    /**
     * emitted width is set
     */
    (textEditorService.limits$ as Subject<any>).next({
      width: 1200,
      height: 500,
    });

  });

  it('should get text style', () => {

    const format = {
      color: '#333333',
      align: null,
    };
    const contents = new Delta([
      {
        insert: 'test.start',
        attributes: {
          fontFamily: 'Montserrat',
          color: '#000000',
          underline: true,
        },
      },
      {
        insert: '\n',
        attributes: {
          align: PebTextJustify.Center,
          color: '#333333',
          fontFamily: 'Open Sans',
        },
      },
      {
        insert: 'test.end',
        attributes: {
          align: PebTextJustify.Center,
          color: '#333333',
          fontFamily: 'Roboto',
        },
      },
    ]);
    const lines = [
      { formats: () => ({ align: PebTextJustify.Center }) },
      { formats: () => ({ align: PebTextJustify.Center }) },
      { formats: () => ({ align: null }) },
    ];
    const quillMock = {
      getFormat: jasmine.createSpy('getFormat').and.returnValue(format),
      getContents: jasmine.createSpy('getContents').and.returnValue(contents),
      getLines: jasmine.createSpy('getLines').and.returnValue(lines),
    };
    const range = {
      index: 0,
      length: 0,
    };

    /**
     * component.range.length is 0
     * attributes.align is null
     */
    component[`range`] = range;
    component[`quill`] = quillMock;
    expect(component[`getTextStyle`]()).toEqual({
      color: format.color,
      textJustify: PebTextJustify.Left,
    } as any);
    expect(quillMock.getFormat).toHaveBeenCalledWith(range);
    expect(quillMock.getContents).not.toHaveBeenCalled();
    expect(quillMock.getLines).not.toHaveBeenCalled();

    /**
     * attributes align is set
     */
    format.align = PebTextJustify.Center;
    expect(component[`getTextStyle`]()).toEqual({
      color: format.color,
      textJustify: PebTextJustify.Center,
    } as any);
    expect(quillMock.getContents).not.toHaveBeenCalled();
    expect(quillMock.getLines).not.toHaveBeenCalled();

    /**
     * component.range.length is 3
     * lines have more than 1 unique alignment
     */
    range.length = 3;
    quillMock.getFormat.calls.reset();

    expect(component[`getTextStyle`]()).toEqual({
      ...PEB_DEFAULT_TEXT_STYLE,
      link: [null, null],
      fontFamily: ['Montserrat', 'Open Sans', 'Roboto'],
      underline: [true, false],
      color: ['#000000', '#333333'],
      textJustify: [PebTextJustify.Center, PebTextJustify.Left],
    } as any);
    expect(quillMock.getFormat).not.toHaveBeenCalled();
    expect(quillMock.getContents).toHaveBeenCalledOnceWith(range);
    expect(quillMock.getLines).toHaveBeenCalledOnceWith(range);

    /**
     * lines have only 1 unique alignment
     */
    lines[2].formats = () => ({ align: PebTextJustify.Center });

    expect(component[`getTextStyle`]()).toEqual({
      ...PEB_DEFAULT_TEXT_STYLE,
      link: [null, null],
      fontFamily: ['Montserrat', 'Open Sans', 'Roboto'],
      underline: [true, false],
      color: ['#000000', '#333333'],
      textJustify: PebTextJustify.Center,
    } as any);
    expect(quillMock.getFormat).not.toHaveBeenCalled();

  });

  it('should handle ng after view init', () => {

    const eventEmitter = new EventEmitter<{ type: string, payload: any }>();
    const quillMock = {
      root: {
        outerHTML: '<span>test outer html</span>',
      },
      clipboard: {
        addMatcher: jasmine.createSpy('addMatcher'),
      },
      history: {
        undo: jasmine.createSpy('undo'),
        redo: jasmine.createSpy('redo'),
        clear: jasmine.createSpy('clear'),
        stack: {
          undo: [{ test: 'stack.undo' }],
          redo: [{ test: 'stack.redo' }],
        },
      },
      enable: jasmine.createSpy('enable'),
      focus: jasmine.createSpy('focus'),
      blur: jasmine.createSpy('blur'),
      format: jasmine.createSpy('format'),
      getSelection: jasmine.createSpy('getSelection'),
      setSelection: jasmine.createSpy('setSelection'),
      getFormat: jasmine.createSpy('getFormat'),
      setContents: jasmine.createSpy('setContents'),
      getContents: jasmine.createSpy('getContents'),
      on: (eventKey: string, handler: Function) => {
        eventEmitter.pipe(
          filter(e => e.type === eventKey),
          map(e => e.payload),
          tap(payload => handler(payload)),
        ).subscribe();
      },
      off: () => null,
    };
    const quillSpy = spyOn(quill, 'default').and.returnValue(quillMock);
    const contentNextSpy = spyOn(component.content$, 'next');
    const textChangedEmitSpy = spyOn(component.textChanged, 'emit');
    const fromResizeSpy = spyOn(pebRenderer, 'fromResizeObserver');
    const getTextStyleSpy = spyOn<any>(component, 'getTextStyle');
    const importSpy = jasmine.createSpy('import');
    const textStyles = {
      fontSize: 32,
      underline: true,
    };
    const ngZone = {
      onStable: of(true),
    };
    const resize$ = new Subject<void>();
    const delta = new Delta([{ insert: 'test content' }]);

    Object.defineProperty(quill.default, 'import', {
      value: importSpy,
    });

    spyOn(rxjsOps, 'throttleTime').and.returnValue(value => value);
    spyOn(pebCore, 'getContentDimensions').and.returnValue({
      width: 1000,
      height: 450,
    });
    getTextStyleSpy.and.returnValue(textStyles);
    fromResizeSpy.and.returnValue(resize$ as any);

    /**
     * component.verticalAlign is null
     */
    component[`ngZone` as any] = ngZone;
    component.verticalAlign = null;
    component.ngAfterViewInit();

    expect(quillMock.setContents).toHaveBeenCalledWith(component.text, 'silent');
    expect(component[`range`]).toEqual({ index: 0, length: 0 } as any);
    expect(textEditorService.setStyles).toHaveBeenCalledOnceWith(textStyles as any);
    expect(getTextStyleSpy).toHaveBeenCalled();
    expect(renderer.setStyle.calls.allArgs()).toEqual([
      [component[`elmRef`].nativeElement, 'font-family', PEB_DEFAULT_FONT_FAMILY],
      [component[`elmRef`].nativeElement, 'color', PEB_DEFAULT_FONT_COLOR],
      [component[`elmRef`].nativeElement, 'font-size', `${PEB_DEFAULT_FONT_SIZE}px`],
    ]);

    const quillArgs = quillSpy.calls.first().args;
    const bindings = (quillArgs[2] as any).modules.keyboard.bindings;
    expect(quillArgs[0]).toEqual(component.quillContainer.nativeElement);
    expect(quillArgs[1]).toEqual(component.document);
    expect(omit(quillArgs[2] as Object, 'modules')).toEqual({
      readOnly: true,
      scrollingContainer: component.quillContainer.nativeElement,
      formats: [
        'color',
        'italic',
        'link',
        'strike',
        'underline',
        'align',
      ],
    } as any);

    /**
     * check list autofill binding
     */
    expect(omit(bindings[`list autofill`], 'handler')).toEqual({
      key: ' ',
      shiftKey: null,
      collapsed: true,
    });
    expect(bindings[`list autofill`].handler()).toBe(true);

    /**
     * check bold binding
     * fontWeight is 900
     */
    quillMock.getFormat.and.returnValue({ fontWeight: 900 });

    expect(omit(bindings.bold, 'handler')).toEqual({
      key: 'b',
      shortKey: true,
    });

    bindings.bold.handler();
    expect(quillMock.getFormat).toHaveBeenCalledTimes(1);
    expect(quillMock.format).toHaveBeenCalledWith('fontWeight', 400);

    /**
     * fontWeight is [300]
     */
    quillMock.getFormat.and.returnValue({ fontWeight: [300] });

    bindings.bold.handler();
    expect(quillMock.getFormat).toHaveBeenCalledTimes(2);
    expect(quillMock.format).toHaveBeenCalledWith('fontWeight', 700);

    /**
     * check added matcher to quill.clipboard
     */
    expect(quillMock.clipboard.addMatcher).toHaveBeenCalledTimes(1);
    const matcherArgs = quillMock.clipboard.addMatcher.calls.first().args;
    const matcherCallback = matcherArgs[1];
    expect(matcherArgs[0]).toEqual(Node.ELEMENT_NODE);

    /**
     * check matcher callback
     */
    quillMock.getSelection.and.returnValue({ index: 1, length: 2 });
    quillMock.getFormat.and.returnValue({ color: '#454545' });
    quillMock.getFormat.calls.reset();
    importSpy.and.returnValue(Delta);

    const node = document.createElement('p');
    node.innerText = 'test';

    expect(matcherCallback(node)).toEqual(new Delta([{
      insert: node.innerText,
      attributes: { color: '#454545' },
    }]));
    expect(quillMock.getSelection).toHaveBeenCalledTimes(1);
    expect(quillMock.getFormat).toHaveBeenCalledOnceWith(1, 0);

    /**
     * emit text-change event on quill
     */
    let payload: any[] = [new Delta([{ insert: 'new' }]), new Delta([{ insert: 'prev' }])];
    eventEmitter.next({
      payload,
      type: 'text-change',
    });

    expect(textEditorService.setRedoStack).toHaveBeenCalledOnceWith(quillMock.history.stack.redo);
    expect(textEditorService.setUndoStack).toHaveBeenCalledOnceWith(quillMock.history.stack.undo);
    expect(contentNextSpy).toHaveBeenCalledOnceWith('bypassed.html');
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(quillMock.root.outerHTML);
    expect(textChangedEmitSpy).toHaveBeenCalledOnceWith(payload[1].compose(payload[0]));

    /**
     * emit fromResize
     */
    contentNextSpy.calls.reset();
    sanitizer.bypassSecurityTrustHtml.calls.reset();
    resize$.next();

    expect(contentNextSpy).toHaveBeenCalledOnceWith('bypassed.html');
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(quillMock.root.outerHTML);

    /**
     * emit selection-change event on quill
     * payload is [null]
     */
    textEditorService.setStyles.calls.reset();
    getTextStyleSpy.calls.reset();
    eventEmitter.next({
      type: 'selection-change',
      payload: [null],
    });

    expect(textEditorService.setStyles).not.toHaveBeenCalled();
    expect(getTextStyleSpy).not.toHaveBeenCalled();

    /**
     * payload is set
     */
    payload = [{ index: 1, length: 2 }];
    component.enabled$.next(true);
    eventEmitter.next({
      payload,
      type: 'selection-change',
    });

    expect(textEditorService.setStyles).toHaveBeenCalledOnceWith(textStyles as any);
    expect(getTextStyleSpy).toHaveBeenCalled();

    /**
     * handle textEditorService commands
     * emit TextEditorCommand.fontSize
     * component.isEnabled is TRUE
     */
    quillMock.format.calls.reset();
    quillMock.setContents.calls.reset();
    quillMock.getContents.and.returnValue(delta);
    textEditorService.setRedoStack.calls.reset();
    textEditorService.setUndoStack.calls.reset();
    textChangedEmitSpy.calls.reset();
    component[`isEnabled`] = true;
    textEditorService.execCommand$.next([TextEditorCommand.fontSize, 32]);

    expect(quillMock.getContents).toHaveBeenCalledTimes(2);
    expect(quillMock.setSelection).not.toHaveBeenCalled();
    expect(quillMock.setContents).not.toHaveBeenCalled();
    expect(quillMock.history.undo).not.toHaveBeenCalled();
    expect(quillMock.history.redo).not.toHaveBeenCalled();
    expect(quillMock.history.clear).not.toHaveBeenCalled();
    expect(textEditorService.setRedoStack).not.toHaveBeenCalled();
    expect(textEditorService.setUndoStack).not.toHaveBeenCalled();
    expect(quillMock.format).toHaveBeenCalledOnceWith(TextEditorCommand.fontSize, 32);
    expect(textChangedEmitSpy).toHaveBeenCalledOnceWith(delta);

    /**
     * emit TextEditorCommand.clearHistory
     * component.isEnabled is FALSE
     */
    quillMock.getContents.calls.reset();
    quillMock.format.calls.reset();
    textChangedEmitSpy.calls.reset();
    component[`isEnabled`] = false;
    textEditorService.execCommand$.next([TextEditorCommand.clearHistory, null]);

    expect(component[`range`]).toEqual({ index: 0, length: 12 } as any);
    expect(quillMock.setSelection).toHaveBeenCalledWith(component[`range`]);
    expect(quillMock.setContents).not.toHaveBeenCalled();
    expect(quillMock.getContents).toHaveBeenCalledTimes(1);
    expect(quillMock.history.undo).not.toHaveBeenCalled();
    expect(quillMock.history.redo).not.toHaveBeenCalled();
    expect(quillMock.history.clear).toHaveBeenCalledBefore(textEditorService.setRedoStack);
    expect(textEditorService.setRedoStack).toHaveBeenCalledWith(quillMock.history.stack.redo);
    expect(textEditorService.setUndoStack).toHaveBeenCalledWith(quillMock.history.stack.undo);
    expect(quillMock.format).not.toHaveBeenCalled();
    expect(textChangedEmitSpy).not.toHaveBeenCalled();

    /**
     * emit TextEditorCommand.redo
     */
    quillMock.history.clear.calls.reset();
    textEditorService.setRedoStack.calls.reset();
    textEditorService.setUndoStack.calls.reset();
    textEditorService.execCommand$.next([TextEditorCommand.redo, null]);

    expect(quillMock.setContents).not.toHaveBeenCalled();
    expect(quillMock.history.undo).not.toHaveBeenCalled();
    expect(quillMock.history.clear).not.toHaveBeenCalled();
    expect(quillMock.history.redo).toHaveBeenCalled();
    expect(quillMock.format).not.toHaveBeenCalled();
    expect(textEditorService.setRedoStack).not.toHaveBeenCalled();
    expect(textEditorService.setUndoStack).not.toHaveBeenCalled();
    expect(textChangedEmitSpy).not.toHaveBeenCalled();

    /**
     * emit TextEditorCommand.undo
     */
    quillMock.history.redo.calls.reset();
    textEditorService.execCommand$.next([TextEditorCommand.undo, null]);

    expect(quillMock.setContents).not.toHaveBeenCalled();
    expect(quillMock.history.redo).not.toHaveBeenCalled();
    expect(quillMock.history.clear).not.toHaveBeenCalled();
    expect(quillMock.history.undo).toHaveBeenCalled();
    expect(quillMock.format).not.toHaveBeenCalled();
    expect(textEditorService.setRedoStack).not.toHaveBeenCalled();
    expect(textEditorService.setUndoStack).not.toHaveBeenCalled();
    expect(textChangedEmitSpy).not.toHaveBeenCalled();

    /**
     * emit TextEditorCommand.Link
     * paylaod is null
     * component.isEnabled is TRUE
     * op.attributes is undefined
     */
    quillMock.history.undo.calls.reset();
    component[`isEnabled`] = true;
    component[`range`] = { index: 5, length: 12 };
    textEditorService.execCommand$.next([TextEditorCommand.link, null]);

    expect(quillMock.setContents).toHaveBeenCalledOnceWith(delta);
    expect(textChangedEmitSpy).toHaveBeenCalledWith(delta);
    expect(quillMock.history.redo).not.toHaveBeenCalled();
    expect(quillMock.history.clear).not.toHaveBeenCalled();
    expect(quillMock.history.undo).not.toHaveBeenCalled();
    expect(quillMock.format).not.toHaveBeenCalled();
    expect(textEditorService.setRedoStack).not.toHaveBeenCalled();
    expect(textEditorService.setUndoStack).not.toHaveBeenCalled();

    /**
     * op.insert is set
     * op.attributes is set
     */
    quillMock.setContents.calls.reset();
    textChangedEmitSpy.calls.reset();
    delta.forEach(op => op.attributes = {
      color: '#333333',
      underline: true,
      link: {
        type: PebInteractionType.NavigateInternal,
        payload: 'url/internal',
      },
    });
    textEditorService.execCommand$.next([TextEditorCommand.link, null]);

    expect(quillMock.setContents).toHaveBeenCalledOnceWith(new Delta([
      {
        ...delta.ops[0],
        insert: 'test ',
      },
      {
        insert: 'content',
        attributes: {
          color: '#333333',
        },
      },
    ]));
    expect(textChangedEmitSpy).toHaveBeenCalledWith(quillMock.setContents.calls.mostRecent().args[0]);

    /**
     * add 2 more ops to delta with prop insert as null
     */
    quillMock.setContents.calls.reset();
    textChangedEmitSpy.calls.reset();
    delta.ops.push(...[
      {
        insert: null,
        attributes: {
          color: PEB_DEFAULT_LINK_COLOR,
        },
      },
      {
        insert: null,
        attributes: {},
      },
    ]);
    textEditorService.execCommand$.next([TextEditorCommand.link, null]);

    expect(quillMock.setContents).toHaveBeenCalledOnceWith(new Delta([
      {
        ...delta.ops[0],
        insert: 'test ',
      },
      {
        insert: 'content',
        attributes: {
          color: '#333333',
        },
      },
      {
        insert: '',
        attributes: {
          color: PEB_DEFAULT_LINK_COLOR,
        },
      },
      {
        insert: '',
        attributes: {},
      },
    ]));
    expect(textChangedEmitSpy).toHaveBeenCalledWith(quillMock.setContents.calls.mostRecent().args[0]);

    /**
     * payload is set
     * op.attributes is null
     */
    quillMock.setContents.calls.reset();
    textChangedEmitSpy.calls.reset();
    delta.ops[0].attributes = null;
    textEditorService.execCommand$.next([TextEditorCommand.link, {
      type: PebInteractionType.NavigateInternal,
      payload: 'url/internal',
    }]);

    expect(quillMock.setContents).toHaveBeenCalledOnceWith(new Delta([
      { insert: 'test ' },
      {
        insert: 'content',
        attributes: {
          link: {
            type: PebInteractionType.NavigateInternal,
            payload: 'url/internal',
          },
          underline: true,
        },
      },
      {
        insert: '',
        attributes: {
          link: {
            type: PebInteractionType.NavigateInternal,
            payload: 'url/internal',
          },
          color: PEB_DEFAULT_LINK_COLOR,
          underline: true,
        },
      },
      {
        insert: '',
        attributes: {
          link: {
            type: PebInteractionType.NavigateInternal,
            payload: 'url/internal',
          },
          underline: true,
        },
      },
    ]));
    expect(textChangedEmitSpy).toHaveBeenCalledWith(quillMock.setContents.calls.mostRecent().args[0]);

    /**
     * op.attributes.link is set
     * add 1 op to delta with prop insert as null
     */
    quillMock.setContents.calls.reset();
    textChangedEmitSpy.calls.reset();
    delta.ops[0].attributes = {
      color: '#454545',
      link: {
        type: PebInteractionType.NavigateExternal,
        payload: 'url/external',
      },
    };
    delta.ops.push({ insert: null });
    textEditorService.execCommand$.next([TextEditorCommand.link, {
      type: PebInteractionType.NavigateInternal,
      payload: 'url/internal',
    }]);

    expect(quillMock.setContents).toHaveBeenCalledOnceWith(new Delta([
      {
        insert: 'test ',
        attributes: {
          color: '#454545',
          link: {
            type: PebInteractionType.NavigateExternal,
            payload: 'url/external',
          },
        },
      },
      {
        insert: 'content',
        attributes: {
          color: '#454545',
          link: {
            type: PebInteractionType.NavigateInternal,
            payload: 'url/internal',
          },
        },
      },
      {
        insert: '',
        attributes: {
          link: {
            type: PebInteractionType.NavigateInternal,
            payload: 'url/internal',
          },
          color: PEB_DEFAULT_LINK_COLOR,
          underline: true,
        },
      },
      {
        insert: '',
        attributes: {
          link: {
            type: PebInteractionType.NavigateInternal,
            payload: 'url/internal',
          },
          underline: true,
        },
      },
      {
        insert: '',
        attributes: {
          link: {
            type: PebInteractionType.NavigateInternal,
            payload: 'url/internal',
          },
          underline: true,
        },
      },
    ]));
    expect(textChangedEmitSpy).toHaveBeenCalledWith(quillMock.setContents.calls.mostRecent().args[0]);

    /**
     * change enabled
     * value is FALSE
     */
    const firstChild = { scrollTop: 120 };
    spyOnProperty(component.quillContainer.nativeElement, 'firstChild').and.returnValue(firstChild);
    quillMock.getSelection.calls.reset();
    quillMock.focus.calls.reset();
    component.enabled = false;

    expect(quillMock.enable).toHaveBeenCalledWith(false);
    expect(quillMock.focus).not.toHaveBeenCalled();
    expect(quillMock.blur).toHaveBeenCalled();
    expect(firstChild.scrollTop).toBe(0);
    expect(quillMock.getSelection).not.toHaveBeenCalled();
    expect(component[`range`]).toEqual({ index: 0, length: 0 } as any);

    /**
     * value is TRUE
     */
    quillMock.enable.calls.reset();
    quillMock.blur.calls.reset();
    component.enabled = true;

    expect(quillMock.enable).toHaveBeenCalledWith(true);
    expect(quillMock.focus).toHaveBeenCalled();
    expect(quillMock.blur).not.toHaveBeenCalled();
    expect(quillMock.getSelection).not.toHaveBeenCalled();
    expect(component[`range`]).toEqual({ index: 0, length: 0 } as any);

    /**
     * emit text-change event on quill
     * component.autosize.width is TRUE
     * component.autosize.height is FALSE
     */
    component.autosize.width = true;
    payload = [new Delta([{ insert: 'new' }]), new Delta([{ insert: 'prev' }])];
    eventEmitter.next({
      payload,
      type: 'text-change',
    });
    resize$.next();

    expect(quillMock.getSelection).toHaveBeenCalled();
    expect(component[`range`]).toEqual({ index: 1, length: 2 } as any);
    expect(textEditorService.setDimensions).toHaveBeenCalledWith({
      width: 1000,
      height: component.quillContainer.nativeElement.getBoundingClientRect().height,
    });

    /**
     * component.autosize.width is FALSE
     * component.autosize.height is TRUE
     */
    component.autosize.width = false;
    component.autosize.height = true;
    textEditorService.execCommand$.next([TextEditorCommand.fontSize, 32]);
    resize$.next();

    expect(textEditorService.setDimensions).toHaveBeenCalledWith({
      width: component.quillContainer.nativeElement.getBoundingClientRect().width,
      height: 450,
    });

    /**
     * emit textEditorService.selection$
     */
    quillMock.setSelection.calls.reset();
    textEditorService.selection$.next({ index: 2, length: 10 });

    expect(quillMock.setSelection).toHaveBeenCalledWith(2, 10);

    /**
     * component.verticalAlign is set
     */
    renderer.setStyle.calls.reset();

    component.verticalAlign = PebTextVerticalAlign.Bottom;
    component.ngAfterViewInit();

    expect(renderer.setStyle.calls.mostRecent().args).toEqual([
      quillMock.root,
      'justify-content',
      PebTextAlignType.FlexEnd,
    ]);

  });

  it('should get style', () => {

    expect(component.style).toEqual('color:#333333');
    expect(sanitizer.bypassSecurityTrustStyle.calls.first().args[0].trim().replace(/\n\s+/gi, ' '))
      .toEqual('height: 100%; overflow: hidden; position: relative; display: block;');

  });

  it('should handle keydown and mousedown events', () => {

    const host: HTMLElement = fixture.nativeElement;
    const mousedown = new MouseEvent('mousedown');
    const keydown = new KeyboardEvent('keydown');
    const stopPropagationSpies = [
      spyOn(mousedown, 'stopPropagation'),
      spyOn(keydown, 'stopPropagation'),
    ];

    /**
     * component.isEnabled is FALSE
     */
    component[`isEnabled`] = false;
    host.dispatchEvent(mousedown);
    host.dispatchEvent(keydown);

    stopPropagationSpies.forEach(spy => expect(spy).not.toHaveBeenCalled());

    /**
     * component.isEnabled is TRUE
     */
    component[`isEnabled`] = true;
    host.dispatchEvent(mousedown);
    host.dispatchEvent(keydown);

    stopPropagationSpies.forEach(spy => expect(spy).toHaveBeenCalled());

  });

  it('should handle ng changes', () => {

    const restoreSpy = spyOn<any>(component, 'restoreSelection');
    const textChangedEmitSpy = spyOn(component.textChanged, 'emit');
    const getTextStyleSpy = spyOn<any>(component, 'getTextStyle');
    const delta = new Delta([{ insert: 'test' }]);
    const textStyles = { fontSize: 32 };
    const quillMock = {
      root: { test: 'root' },
      getContents: jasmine.createSpy('getContents').and.returnValue(delta),
      setContents: jasmine.createSpy('setContents'),
    };
    const changes = {
      text: null,
      verticalAlign: null,
      scale: null,
    };

    getTextStyleSpy.and.returnValue(textStyles);

    /**
     * component.quill is null
     */
    component[`quill`] = null;
    component.ngOnChanges(changes);

    expect(restoreSpy).not.toHaveBeenCalled();
    expect(textChangedEmitSpy).not.toHaveBeenCalled();
    expect(getTextStyleSpy).not.toHaveBeenCalled();
    expect(textEditorService.setStyles).not.toHaveBeenCalled();
    expect(renderer.setStyle).not.toHaveBeenCalled();

    /**
     * component.quill is set
     */
    component[`quill`] = quillMock;
    component.ngOnChanges(changes);

    expect(quillMock.getContents).not.toHaveBeenCalled();
    expect(quillMock.setContents).not.toHaveBeenCalled();
    expect(restoreSpy).not.toHaveBeenCalled();
    expect(textChangedEmitSpy).not.toHaveBeenCalled();
    expect(getTextStyleSpy).not.toHaveBeenCalled();
    expect(textEditorService.setStyles).not.toHaveBeenCalled();
    expect(renderer.setStyle).not.toHaveBeenCalled();

    /**
     * changes.scale is set
     */
    changes.scale = new SimpleChange(1, 2, true);

    component.ngOnChanges(changes);

    expect(restoreSpy).toHaveBeenCalled();
    expect(quillMock.getContents).not.toHaveBeenCalled();
    expect(quillMock.setContents).not.toHaveBeenCalled();
    expect(textChangedEmitSpy).not.toHaveBeenCalled();
    expect(getTextStyleSpy).not.toHaveBeenCalled();
    expect(textEditorService.setStyles).not.toHaveBeenCalled();
    expect(renderer.setStyle).not.toHaveBeenCalled();

    /**
     * changes.verticalAlign is set
     * previous value is equal to current value
     */
    changes.scale = null;
    changes.verticalAlign = new SimpleChange(PebTextVerticalAlign.Bottom, PebTextVerticalAlign.Bottom, true);
    restoreSpy.calls.reset();

    component.ngOnChanges(changes);

    expect(restoreSpy).toHaveBeenCalled();
    expect(quillMock.getContents).not.toHaveBeenCalled();
    expect(quillMock.setContents).not.toHaveBeenCalled();
    expect(textChangedEmitSpy).not.toHaveBeenCalled();
    expect(getTextStyleSpy).not.toHaveBeenCalled();
    expect(textEditorService.setStyles).not.toHaveBeenCalled();
    expect(renderer.setStyle).not.toHaveBeenCalled();

    /**
     * previous value is NOT equal to current value
     */
    changes.verticalAlign = new SimpleChange(PebTextVerticalAlign.Bottom, PebTextVerticalAlign.Top, false);

    component.ngOnChanges(changes);

    expect(restoreSpy).toHaveBeenCalledTimes(2);
    expect(quillMock.getContents).not.toHaveBeenCalled();
    expect(quillMock.setContents).not.toHaveBeenCalled();
    expect(textChangedEmitSpy).not.toHaveBeenCalled();
    expect(getTextStyleSpy).not.toHaveBeenCalled();
    expect(textEditorService.setStyles).not.toHaveBeenCalled();
    expect(renderer.setStyle).toHaveBeenCalledOnceWith(
      quillMock.root,
      'justify-content',
      PebTextAlignType.FlexStart,
    );

    /**
     * changes.text is set
     * component.isEnabled is FALSE
     * previous value is equal to current value
     */
    changes.verticalAlign = null;
    changes.text = new SimpleChange(delta, delta, true);
    restoreSpy.calls.reset();
    renderer.setStyle.calls.reset();

    component[`isEnabled`] = false;
    component.ngOnChanges(changes);

    expect(restoreSpy).toHaveBeenCalled();
    expect(quillMock.getContents).toHaveBeenCalled();
    expect(textChangedEmitSpy).not.toHaveBeenCalled();
    expect(quillMock.setContents).not.toHaveBeenCalled();
    expect(textEditorService.setStyles).not.toHaveBeenCalled();
    expect(renderer.setStyle).not.toHaveBeenCalled();

    /**
     * component.isEnabled is TRUE
     * previous value is NOT equal to current value
     */
    changes.text = new SimpleChange(delta, new Delta([{ insert: 'new test' }]), false);

    component[`isEnabled`] = true;
    component.ngOnChanges(changes);

    expect(restoreSpy).toHaveBeenCalledTimes(2);
    expect(quillMock.getContents).toHaveBeenCalledTimes(2);
    expect(textChangedEmitSpy).toHaveBeenCalledWith(delta);
    expect(quillMock.setContents).toHaveBeenCalledWith(changes.text.currentValue, 'silent');
    expect(textEditorService.setStyles).toHaveBeenCalledWith(textStyles as any);
    expect(getTextStyleSpy).toHaveBeenCalled();
    expect(renderer.setStyle).not.toHaveBeenCalled();

  });

  it('should restore selection', fakeAsync(() => {

    const quillMock = {
      setSelection: jasmine.createSpy('setSelection'),
      focus: jasmine.createSpy('focus'),
    };
    const range = { index: 5, length: 10 };

    /**
     * component.range is null
     */
    component[`range`] = null;
    component[`isEnabled`] = true;
    component[`quill`] = quillMock;
    component[`restoreSelection`]();

    expect(quillMock.setSelection).not.toHaveBeenCalled();
    expect(quillMock.focus).not.toHaveBeenCalled();

    /**
     * component.range is set
     */
    component[`range`] = range;
    component[`restoreSelection`]();

    flush();

    expect(quillMock.setSelection).toHaveBeenCalledWith(range);
    expect(quillMock.focus).toHaveBeenCalled();

  }));

  it('should compare objects', () => {

    const obj1 = {
      test: true,
      test2: { value: false },
    };
    const obj2 = {
      test: true,
    };

    /**
     * argument obj2 is undefined
     */
    expect(component[`compareObjects`](obj1, undefined)).toBe(false);

    /**
     * obj1 keys' length is more than obj2 keys
     */
    expect(component[`compareObjects`](obj1, obj2)).toBe(false);

    /**
     * objects are equal
     */
    expect(component[`compareObjects`](obj1, obj1)).toBe(true);

  });

});
