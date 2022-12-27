import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppThemeEnum } from '@pe/common';

import { TextEditorIcons } from '../interfaces/icons';
import { CommandExecutorService } from '../services/command-executor.service';
import { TextEditorService } from '../services/text-editor.service';
import { DEFAULT_FONT_COLOR, DEFAULT_FONT_SIZE, ExecuteCommands } from '../text-editor.constants';
import {
  ExecuteCommandAction,
  TextDecorationInterface,
  TextOptionsInterface,
  ToolbarOptionsInterface,
} from '../text-editor.interface';
import {
  getRange,
  restoreSelection,
  hasList,
  clean,
  isInLastPosition,
  hasDecoration,
  fontSizeToNumber,
  hasFontColor,
  hasFontSize,
  removeRange,
  hasJustify,
  isTextSelected,
} from '../text-editor.utils';

@Component({
  selector: 'pe-text-editor',
  styleUrls: ['text-editor.component.scss'],
  templateUrl: 'text-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextEditorComponent),
    multi: true,
  }],
})
export class TextEditorComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  savedRange: Range;
  isFocused = false;

  @Input() theme = AppThemeEnum.default;
  @Input() editable = false;
  @Input() smartToolbar = true;
  @Input() placeholder: string;
  @Input() htmlText: string;
  @Input() color: string;
  @Input() align: string;
  @Input() fontSize: number;
  @Input() fontWeight: string;
  @Input() isOutlineNone = true;
  @Output() contentChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() editorBlur: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();
  @Output() editorFocus: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();
  @Output() editorClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output() caretSet: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('textArea', { static: true }) textArea: ElementRef<HTMLElement>;
  @ViewChild('placeholderEl', { static: true }) placeholderElem: ElementRef<HTMLElement>;
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject();
  private toolbarOptions: ToolbarOptionsInterface = {
    [ExecuteCommands.BOLD]: false,
    [ExecuteCommands.ITALIC]: false,
    [ExecuteCommands.UNDERLINE]: false,
    color: DEFAULT_FONT_COLOR,
    fontSize: DEFAULT_FONT_SIZE,
  };

  @HostListener('focusin') focused() {
    this.onFocus(true);
  }

  @HostListener('focusout') focusedOut() {
    this.onFocus(false);
  }

  constructor(
    public editorService: TextEditorService,
    private renderer: Renderer2,
    private executorService: CommandExecutorService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
    Object.entries(TextEditorIcons).forEach(([name, path]) => {
      this.matIconRegistry.addSvgIcon(name, this.domSanitizer.bypassSecurityTrustResourceUrl(path));
    });
  }

  onChange = (_: any) => {};
  onTouch: any = () => {}
  set value(val){  // this value is updated by programmatic changes if( val !== undefined && this.val !== val){
    this.htmlText = val;
    this.onChange(val);
    this.onTouch(val);
  }

  onFocus(event) {
    this.isFocused = true;
  }

  get value () {
    return this.htmlText;
  }

  writeValue(value: any): void {
    this.value = value;
    this.textArea.nativeElement.innerHTML = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  onContentPasted(event: ClipboardEvent): void {
    const text: string = event.clipboardData.getData('text');
    this.executorService.insertTextAtRange(text, this.shadowRange, this.shadowSelection);
    this.emitContentChange();
    this.handleToolbarOptions();
    event.preventDefault();
  }

  get shadowSelection(): Selection {
    return window.getSelection && window.getSelection();
  }

  get shadowRange(): Range {
    const contentEditable = document.activeElement.getAttribute('contenteditable');
    const range = contentEditable? getRange(this.shadowSelection) : this.savedRange;

    return range;
  }

  ngAfterViewInit(): void {
    this.editorService.triggerCommand$.pipe(takeUntil(this.destroyed$)).subscribe((action: ExecuteCommandAction) => {
      if (!this.editable) {
        return ;
      }
      switch (action.key) {
        case ExecuteCommands.FONT_SIZE:
          if (!this.savedRange) {
            this.setCaretToEnd();
          } else {
            restoreSelection(this.savedRange, this.shadowSelection);
          }
          this.toolbarOptions.fontSize = Number(action.value);
          this.executorService.setFontSize(Number(action.value), this.renderer, this.textArea.nativeElement);
          break;
        case ExecuteCommands.INSERT_LINK:
          restoreSelection(this.savedRange, this.shadowSelection);
          this.executorService.insertLink(action.value, action.options, this.renderer);
          break;
        case ExecuteCommands.SET_FOCUS:
          this.setFocus();
          break;
        case ExecuteCommands.SET_CARET:
          this.setCaret();
          break;
        case ExecuteCommands.TEXT_COLOR:
          this.toolbarOptions.color = action.value;
          if (!hasList()) {
            if (this.savedRange && this.savedRange.collapsed && !this.executorService.isInLastPosition()) {
              this.executorService.execute(ExecuteCommands.SELECT_ALL);
            } else {
              restoreSelection(this.savedRange, this.shadowSelection);
            }
            this.executorService.execute(action.key, action.value);
          } else {
            this.executorService.setListColor(this.savedRange, action.value, this.renderer);
          }
          if (this.shadowRange && !this.shadowRange.collapsed) {
            this.executorService.setSelectionLinksColor(
              action.value,
              this.shadowRange,
              this.shadowSelection,
              this.renderer
            );
          }
          break;
        case ExecuteCommands.PLACEHOLDER:
          this.executorService.insertPlaceholder(action.value, this.renderer, this.textArea);
          break;
        default:
          restoreSelection(this.savedRange, this.shadowSelection);
          this.executorService.execute(action.key, action.value);
          this.setCaretToEnd();
      }

      if ([ExecuteCommands.BOLD, ExecuteCommands.ITALIC, ExecuteCommands.UNDERLINE].includes(action.key)) {
        this.toolbarOptions[action.key] = !this.toolbarOptions[action.key];
      }
      if ([
        ExecuteCommands.JUSTIFY_RIGHT,
        ExecuteCommands.JUSTIFY_CENTER,
        ExecuteCommands.JUSTIFY_LEFT,
        ExecuteCommands.JUSTIFY_FULL,
      ].includes(action.key)) {
        this.toolbarOptions.justify = action.key;
      }
      if ([ExecuteCommands.LIST_UNORDERED, ExecuteCommands.LIST_ORDERED].includes(action.key)) {
        this.toolbarOptions.list = action.key;
        if (this.savedRange.collapsed) {
          if (this.shadowRange) {
            this.shadowRange.setStartAfter(this.savedRange.commonAncestorContainer);
          } else {
            restoreSelection(this.savedRange, this.shadowSelection);
          }
        }
      }

      this.emitContentChange();
      this.saveSelection();
    });
    if (this.htmlText) {
      this.textArea.nativeElement.innerHTML = this.htmlText;
    }
  }

  setFocus(): void {
    this.textArea.nativeElement.focus();
  }

  setCaret(): void {
    if (this.savedRange) {
      restoreSelection(this.savedRange, this.shadowSelection);
      this.saveSelection();
    } else {
      this.setCaretToEnd();
    }
    this.handleToolbarOptions(true);
    this.caretSet.emit();
  }

  setCaretToEnd(): void {
    this.executorService.setCaretToEnd(this.textArea.nativeElement);
    this.saveSelection();
    this.handleToolbarOptions();
  }

  setDefault(): void {
    this.textArea.nativeElement.innerHTML = '<span>&#8203</span>';
  }

  selectAll(): void {
    this.executorService.execute(ExecuteCommands.SELECT_ALL);
  }

  onTextAreaBlur(event: FocusEvent): void {
    /** save selection if focussed out */
    this.htmlText = (event.target as HTMLElement).innerText.trim();
    if (this.htmlText !== '') {
      clean(this.textArea.nativeElement, this.renderer);
      this.savedRange = this.shadowSelection.getRangeAt(0);
      this.saveSelection();
    }
    this.editorBlur.emit(event);
  }

  onTextAreaFocus(event: FocusEvent): void {
    this.editorFocus.emit(event);
  }

  onTextAreaClick(event: MouseEvent): void {
    if (this.editable) {
      this.saveSelection();
      this.handleToolbarOptions();
      if (getRange(this.shadowSelection) === null) {
        this.setCaretToEnd();
      }
    }
    this.editorClick.emit(event);
  }

  onMouseLeave(): void {
    this.saveSelection();
    if (this.savedRange && !this.savedRange.collapsed) {
      this.handleToolbarOptions();
    }
  }

  onContentChanged(event: any): void {
    if (event.data !== null && event.data !== undefined && isInLastPosition(this.savedRange)) {
      const options: TextOptionsInterface = {};
      const textColor: string = hasFontColor();
      const fontSize: number = fontSizeToNumber(hasFontSize(this.shadowSelection));
      const decorations: TextDecorationInterface = hasDecoration();
      options.color = this.toolbarOptions.color !== textColor ? this.toolbarOptions.color : undefined;
      options.fontSize = this.toolbarOptions.fontSize !== fontSize ? this.toolbarOptions.fontSize : undefined;
      let hasDecChange = false;
      for (const key in decorations) {
        if (decorations[key] !== this.toolbarOptions[key]) {
          options[key] = this.toolbarOptions[key];
          hasDecChange = true;
        }
      }

      if (options.color || options.fontSize || hasDecChange) {
        this.executorService.insertText(event.data,  options, this.renderer, this.textArea.nativeElement);
      }
      this.editorService.toggleToolbarAction$.next({ action: 'textDecoration', value: decorations });
      this.saveSelection();
    }
    this.emitContentChange();
    this.handleToolbarOptions();
  }

  saveSelection(): void {
    if (this.editable) {
      this.executorService.savedRange = this.savedRange = this.shadowRange;
    }
  }

  removeRange(): void {
    removeRange(this.shadowSelection);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  handleToolbarOptions(skipColor?: boolean): void {
    if (this.editable) {
      setTimeout(() => {
        const decorations: TextDecorationInterface = hasDecoration();
        this.toolbarOptions = { ...this.toolbarOptions, ...decorations };
        this.toolbarOptions.justify = hasJustify();
        this.toolbarOptions.list = hasList();
        this.editorService.toggleToolbarAction$.next({ action: 'contentList', value: this.toolbarOptions.list });
        this.editorService.toggleToolbarAction$.next({ action: 'textDecoration', value: decorations });
        this.editorService.toggleToolbarAction$.next({ action: 'justifyContent', value: this.toolbarOptions.justify });

        const fontSize: number = fontSizeToNumber(hasFontSize(this.shadowSelection));
        if (fontSize) {
          this.editorService.toggleToolbarAction$.next({ action: 'currentFontSize', value: fontSize });
          this.toolbarOptions.fontSize = fontSize;
        }
        // change toolbar color to selected text color
        const fontColor: string = hasFontColor();
        if (!skipColor && fontColor && fontColor !== this.color &&
          (!isInLastPosition(this.savedRange) || isTextSelected(this.savedRange))) {
          this.editorService.toggleToolbarAction$.next({ action: 'currentFontColor', value: fontColor });
          this.toolbarOptions.color = fontColor;
        }
      });
    }
  }

  private emitContentChange(): void {
    this.htmlText = this.textArea.nativeElement.innerHTML;
    this.onChange(this.htmlText);
    this.contentChange.emit(this.textArea.nativeElement.innerHTML);
  }

}
