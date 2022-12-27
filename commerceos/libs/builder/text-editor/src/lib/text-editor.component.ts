import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle } from '@angular/platform-browser';
import Delta from 'quill-delta';
import { animationFrameScheduler, fromEvent, merge, ReplaySubject, Subject } from 'rxjs';
import {
  delay,
  distinctUntilChanged,
  filter,
  first,
  map,
  repeat,
  share,
  skip,
  switchMap,
  take,
  takeUntil,
  tap,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';

import {
  getContentDimensions,
  getStartRange,
  PebEditorState,
  PebTextJustify,
  PebTextVerticalAlign,
  PEB_DEFAULT_FONT_COLOR,
  PEB_DEFAULT_FONT_FAMILY,
  PEB_DEFAULT_FONT_SIZE,
  textAlignToJustifyContent,
} from '@pe/builder-core';
import { fromResizeObserver, PebQuillRenderer } from '@pe/builder-renderer';

import { default as Quill } from './quill';
import { PebTextActivationService } from './text-editor-activation.service';
import { PebTextSelectionStyles, PEB_DEFAULT_TEXT_STYLE, TextEditorCommand } from './text-editor.interface';
import { PebTextEditorService } from './text-editor.service';
import { observeTextMutation } from './text-mutation';



@Component({
  selector: 'peb-text-editor',
  template: `
    <div
      class="ql-container autosize"
      #autosize
      [innerHTML]="content$ | async"
      [style.maxWidth]="maxWidth$ | async"
    ></div>
    <div #quill class="ql-container"></div>
  `,
  /** For Quill editor styles, make sure `./quill.scss` is added to app global styles in workspace.json */
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebTextEditor implements AfterViewInit, OnChanges, OnDestroy {

  @Input() verticalAlign: PebTextVerticalAlign;
  @Input() text: Delta;

  /**
   * Use @Input binding instead of editor state scale
   * because page previews rendered in different scale.
   */
  @Input() scale = 1;
  @Input() document: Document;
  @Input() set enabled(value: boolean) {
    this.isEnabled = value ?? false;
    this.enabled$.next(this.isEnabled);
  }

  @Input() readOnly = false;

  @Input() autosize = { height: false, width: false };

  @Output() textChanged = new EventEmitter<Delta>();

  @ViewChild('quill', { static: true }) quillContainer: ElementRef;
  @ViewChild('autosize', { static: true }) autosizeContainer: ElementRef;

  readonly content$ = new ReplaySubject<SafeHtml>(1);
  readonly enabled$ = new ReplaySubject<boolean>();

  quillDestroy$ = new Subject<void>();

  maxWidth$ = this.textEditorService.limits$.pipe(
    map(({ width }) => {
      if (this.autosize.width) {
        return width ? `${width}px` : '100%';
      }

      return `${this.quillContainer.nativeElement.getBoundingClientRect().width}px`;
    }),
    distinctUntilChanged(),
  );

  private readonly destroy$ = new Subject<void>();
  private isEnabled = false;
  private quill: typeof Quill;
  private range: { index: number; length: number };
  private prevRange: { index: number; length: number };

  mousedown: () => void;
  keydown: () => void;

  constructor(
    private textActivationService: PebTextActivationService,
    private textEditorService: PebTextEditorService,
    private elmRef: ElementRef,
    private state: PebEditorState,
    private sanitizer: DomSanitizer,
    private ngZone: NgZone,
    private renderer: Renderer2,
    private deltaRenderer: PebQuillRenderer,
  ) {
    const stopPropagation = (event) => {
      if (this.isEnabled) {
        event.stopPropagation();
      }
    }

    if (!this.readOnly) {
      this.mousedown = renderer.listen(elmRef.nativeElement, 'mousedown', e => stopPropagation(e));
      this.keydown = renderer.listen(elmRef.nativeElement, 'keydown', e => stopPropagation(e));
    }
  }

  /**
   * Parse Delta manually as Quill does not return arrays for all properties
   * even if there multiple values in selection.
   */
  private getTextStyle(text?: Delta): PebTextSelectionStyles {
    let format;

    if (this.enabled) {
      this.range.index = 0;
      this.range.length = this.quill.getLength();
    }

    if (!this.range) {
      this.range = {
        index: 0,
        length: text.length(),
      }
    }

    if (this.range.length) {
      const delta = text || this.quill.getContents(this.range);

      format = delta.ops.reduce((acc, op) => {
        const newLine = op.insert && op.insert.match(/^\n/g);
        if (!op.attributes?.align) {
          op.attributes = {
            ...op.attributes,
            align: PebTextJustify.Left,
          }
        }
        const attributes = newLine ? { ...op.attributes } : { ...PEB_DEFAULT_TEXT_STYLE, ...op.attributes };

        delete attributes.align;

        Object.entries(attributes).forEach(([key, value]) => {
          if (acc[key] !== undefined) {
            if (Array.isArray(acc[key])) {
              if (acc[key].every(el => !this.compareObjects(el, value))) {
                acc[key].push(value);
              }
            } else if (!Array.isArray(acc[key])
              && !this.compareObjects(acc[key], value)
            ) {
              acc[key] = [acc[key], value];
            }
          } else {
            acc[key] = value;
          }
        });

        return acc;
      }, {});

      const alignmentsManual = text?.ops.reduce((acc, op) => {
        op.attributes?.align && acc.push(op.attributes.align);

        return acc;
      }, []);
      const alignments = text ? alignmentsManual
        : this.quill.getLines(this.range).map(line => line.formats()).map(({ align }) => align ?? PebTextJustify.Left);
      const unique = [...new Set(alignments)];
      format.textJustify = unique.length > 1 ? unique : unique[0];
    } else {
      /**
       * Just take styles from cursor position.
       * Can't be multiple values for style properties as no text selected.
       */
      const attributes = this.quill.getFormat(this.range);
      const textJustify = attributes.align ?? PebTextJustify.Left;
      delete attributes.align;

      format = { ...attributes, textJustify };
    }

    return format;
  }

  ngAfterViewInit() {
    this.renderer.setStyle(this.elmRef.nativeElement, 'font-family', PEB_DEFAULT_FONT_FAMILY);
    this.renderer.setStyle(this.elmRef.nativeElement, 'color', PEB_DEFAULT_FONT_COLOR);
    this.renderer.setStyle(this.elmRef.nativeElement, 'font-size', `${PEB_DEFAULT_FONT_SIZE}px`);

    this.quillDestroy();

    this.enabled$.pipe(
      skip(1),
      distinctUntilChanged(),
      tap((value) => {
        const quillContainer = this.quillContainer.nativeElement;
        while (quillContainer.firstChild) {
          quillContainer.removeChild(quillContainer.lastChild);
        }
        value ? this.quillInit() : this.quillDestroy();
      }),
      delay(0),
      withLatestFrom(this.textEditorService.cursorPosition$),
      tap(([value, { x, y }]) => {
        const rangeIndex = getStartRange(this.quillContainer.nativeElement, this.scale, x, y);
        this.quill?.enable(value);
        this.quill?.setSelection({ index: rangeIndex, length: 0 });
        value ? this.quill?.focus() : this.quill?.blur();
        this.prevRange = null;
        if (!value) {
          this.prevRange = { ...this.range };
          this.range = { index: 0, length: this.text.length() };
          this.quillContainer.nativeElement.firstChild.scrollTop = 0;
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private quillInit() {
    this.quill = new Quill(
      this.quillContainer.nativeElement,
      this.document,
      {
        readOnly: true,
        /**
         * Fix selection jumping
         * @link https://github.com/quilljs/quill/blob/5b28603337f3a7a2b651f94cffc9754b61eaeec7/core/quill.js#L171
         */
        scrollingContainer: this.document.body,
        formats: [
          'color',
          'italic',
          'link',
          'strike',
          'underline',
          'align',
        ],
        modules: {
          keyboard: {
            bindings: {
              /** Disable lists autoformatting, TODO: remove after lists support added in UI */
              'list autofill': {
                key: ' ',
                shiftKey: null,
                collapsed: true,
                handler: () => {
                  return true;
                },
              },
              bold: {
                key: 'b',
                shortKey: true,
                handler: () => {
                  const format = this.quill.getFormat();
                  const fontWeight = Array.isArray(format.fontWeight) ? format.fontWeight[0] : format.fontWeight;
                  this.quill.format('fontWeight', fontWeight >= 700 ? 400 : 700);
                },
              },
            },
          },
        },
      },
    );

    this.quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node) => {
      const deltaPath = 'delta';
      const delta = Quill.import(deltaPath);
      const selection = this.quill.getSelection();

      return new delta().insert(node.innerText, this.quill.getFormat(selection.index, 0));
    });

    if (this.text) {
      this.quill.setContents(this.text, 'silent');
    }

    if (this.verticalAlign) {
      this.renderer.setStyle(
        this.quillContainer.nativeElement.firstChild,
        'justify-content',
        textAlignToJustifyContent(this.verticalAlign),
      );
    }

    const textChange$ = fromEvent<[Delta, Delta]>(this.quill, 'text-change').pipe(
      tap(([delta, previous]) => {
        this.textEditorService.setRedoStack(this.quill.history.stack.redo);
        this.textEditorService.setUndoStack(this.quill.history.stack.undo);
        const updated = previous.compose(delta);
        this.text = updated;
        this.content$.next(this.sanitizer.bypassSecurityTrustHtml(this.quill.root.outerHTML));
        this.textChanged.emit(updated);
      }),
      /** When new line added need to wait until quill renders cursor */
      switchMap(() => fromResizeObserver(this.quill.root).pipe(
        take(1),
        tap(() => {
          this.content$.next(this.sanitizer.bypassSecurityTrustHtml(this.quill.root.outerHTML));
        }),
      )),
      share(),
      takeUntil(this.quillDestroy$),
    );

    /** Should be always subscribed to place cursor in right position */
    const selection$ = fromEvent(this.quill, 'selection-change').pipe(
      throttleTime(0, animationFrameScheduler, { trailing: true }),
      map(([range]) => range),
      share(),
    );

    const selectionRange$ = merge(
      selection$,
      textChange$.pipe(map(() => this.quill.getSelection())),
    ).pipe(
      filter(range => range !== null),
      tap((value) => {
        this.range = value;
      }),
      takeUntil(this.quillDestroy$),
      repeat(),
    );

    const selectionStyle$ = selection$.pipe(
      filter(range => range !== null),
      withLatestFrom(this.enabled$),
      switchMap(() => this.ngZone.onStable.pipe(
        first(),
        tap(() => {
          this.textEditorService.setStyles(this.getTextStyle());
        }),
      ))
    );

    const setStyle$ = this.textEditorService.execCommand$.pipe(
      tap(([cmd, payload]) => {
        const delta = this.quill.getContents();

        if (!this.isEnabled) {
          this.range = { index: 0, length: delta.length() };
          this.quill.setSelection(this.range);
        }

        /** Process links manually to keep text colors if changed by user */
        if (cmd === TextEditorCommand.link) {
          this.prevRange = payload ? this.prevRange : null;
          const start = this.prevRange?.index ?? this.range.index;
          const end = start + (this.prevRange?.length ?? this.range.length);
          const before = delta.slice(0, start);
          const after = delta.slice(end);
          const selected = delta.slice(start, end);

          let insert: Delta;

          if (payload === null) {
            /** Remove link */
            insert = new Delta(selected.map((op) => {
              /** Remove default link color and underline */
              if (op.attributes) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { underline, link, ...rest } = op.attributes;
                op.attributes = rest;
              }

              if (op.insert == null) {
                op.insert = '';
              }

              return op;
            }));
          } else {
            /** Set link */
            insert = new Delta(selected.map((op) => {
              /** Do not change color if link already present and just updated */
              if (op.attributes?.link === undefined) {
                op.attributes = {
                  ...op.attributes,
                  link: payload,
                  underline: true,
                };
              } else {
                op.attributes = { ...op.attributes, link: payload };
              }

              if (op.insert == null) {
                op.insert = '';
              }

              return op;
            }));
          }

          const updated = before.concat(insert).concat(after);
          updated.forEach((op) => {
            if (!op.insert) {
              op.insert = '';
            }
          });
          this.quill.setContents(updated);
          this.textChanged.emit(updated);
        } else if (cmd === TextEditorCommand.undo) {
          this.quill.history.undo();
        } else if (cmd === TextEditorCommand.redo) {
          this.quill.history.redo();
        } else if (cmd === TextEditorCommand.clearHistory) {
          this.quill.history.clear();
          this.textEditorService.setRedoStack(this.quill.history.stack.redo);
          this.textEditorService.setUndoStack(this.quill.history.stack.undo);
        } else {
          this.quill.format(cmd, payload);
          this.textChanged.emit(this.quill.getContents());
        }
      }),
      share(),
    );

    const autoSize$ = merge(
      observeTextMutation(this.autosizeContainer.nativeElement).pipe(takeUntil(this.quillDestroy$)),
      setStyle$.pipe(
        switchMap(([cmd]) => fromResizeObserver(this.autosizeContainer.nativeElement).pipe(
          filter(() => {
            return ![
              TextEditorCommand.undo,
              TextEditorCommand.redo,
              TextEditorCommand.clearHistory,
            ].includes(cmd);
          }),
          take(1),
        )),
      ),
    ).pipe(
      filter(() => this.autosize.height || this.autosize.width),
      throttleTime(0, animationFrameScheduler, { trailing: true }),
      map(() => getContentDimensions(this.autosizeContainer.nativeElement)),
      map(({ width, height }) => {
        return {
          width: this.autosize.width
            ? Math.max(32, width / this.scale )
            : this.quillContainer.nativeElement.getBoundingClientRect().width / this.scale,
          height: this.autosize.height
            ? Math.max(18, height / this.scale )
            : this.quillContainer.nativeElement.getBoundingClientRect().height / this.scale,
        };
      }),
      tap((value) => {
        this.textEditorService.setDimensions(value);
      }),
    );

    const setSelection$ = this.textEditorService.selection$.pipe(
      tap(({ index, length }) => {
        this.quill?.setSelection(index, length);
      }),
    );

    merge(
      textChange$,
      selectionStyle$,
      autoSize$,
      setStyle$,
      setSelection$,
      selectionRange$,
    ).pipe(
      takeUntil(this.quillDestroy$),
    ).subscribe();
  }

  private quillDestroy() {
    const child = this.quillContainer.nativeElement.children[0];

    if (child) {
      this.renderer.removeChild(this.quillContainer.nativeElement, child)
    }

    const quillEditor = this.renderer.createElement('div');

    this.renderer.addClass(quillEditor, 'ql-editor');
    this.renderer.appendChild(this.quillContainer.nativeElement, quillEditor);

    delete this.quill;

    this.quillDestroy$.next()

    if (this.text) {
      quillEditor.innerHTML = this.deltaRenderer.render(this.text, 1);
    }
    this.range = { index: 0, length: this.text.length() };
    // this.textEditorService.setStyles(this.getTextStyle());

    if (this.verticalAlign) {
      this.renderer.setStyle(
        quillEditor,
        'justify-content',
        textAlignToJustifyContent(this.verticalAlign),
      );
    }
  }

  /** Use @HostBinding because of `ViewEncapsulation.None` */
  @HostBinding('style') get style(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(`
      height: 100%;
      overflow: hidden;
      position: relative;
      display: block;
    `);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.quill) {
      if (changes.text) {
        const text = this.quill.getContents();

        if (this.isEnabled) {
          /** Prevent text reset by submitting actions from other forms and restore content */
          this.textChanged.emit(text);
        }

        if ((changes.text.currentValue as Delta).diff(text).length()) {
          this.quill.setContents(changes.text.currentValue, 'silent');
          this.textEditorService.setStyles(this.getTextStyle());
        }

        this.restoreSelection();
      }

      if (changes.verticalAlign) {
        if (changes.verticalAlign.previousValue !== changes.verticalAlign.currentValue) {
          this.renderer.setStyle(
            this.quill.root,
            'justify-content',
            textAlignToJustifyContent(changes.verticalAlign.currentValue),
          );
        }
        this.restoreSelection();
      }

      if (changes.scale) {
        this.restoreSelection();
      }
    } else {
      if (changes.text) {
        this.textEditorService.setStyles(this.getTextStyle(changes.text.currentValue));
        const quillEditor = this.quillContainer.nativeElement.querySelector('.ql-editor');
        if (quillEditor) {
          const firstLine = (changes.text.currentValue as Delta).ops[0];
          if (firstLine.attributes?.verticalAlign) {
            this.verticalAlign = firstLine.attributes.verticalAlign;
            this.renderer.setStyle(
              quillEditor,
              'justify-content',
              textAlignToJustifyContent(this.verticalAlign),
            );
          }
          quillEditor.innerHTML = this.deltaRenderer.render(changes.text.currentValue, 1);
        }
      }
    }
  }

  /** Restore focus on text selection */
  private restoreSelection(): void {
    if (this.range && this.isEnabled && this.quill) {
      setTimeout(() => {
        this.quill.setSelection(this.range);
        this.quill.focus();
      });
    }
  }

  private compareObjects(obj1, obj2) {
    if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined) {
      return false;
    }

    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
      const keys = Object.keys(obj1);
      if (keys.length > Object.keys(obj2).length) {
        return false;
      }

      return keys.every(key => this.compareObjects(obj1[key], obj2[key]));
    }

    return obj1 === obj2;
  }

  ngOnDestroy(): void {
    this.mousedown();
    this.keydown();
    this.destroy$.next();
  }
}
