import { ElementRef, Injectable, Renderer2 } from '@angular/core';

import { EMPTY_CHAR, ESCAPE_CHAR, ExecuteCommands } from '../text-editor.constants';
import { TextOptionsInterface } from '../text-editor.interface';
import {
  isValidURL,
  restoreSelection,
  hasList,
  isHtmlElement,
  compareByChars,
} from '../text-editor.utils';

@Injectable({ providedIn:'root' })
export class CommandExecutorService {
  /** saves the selection from the editor when focussed out */
  savedRange: Range;

  get selection(): Selection {
    return window.getSelection && window.getSelection();
  }

  /**
   * executes command from the toolbar
   *
   * @param command command to be executed
   * @param value command value to be executed
   */
  execute(command: string, value?: string): void {
    document.execCommand(command, false, value || null);
  }

  insertPlaceholder(placeholder: string, renderer: Renderer2, textarea: ElementRef<HTMLElement>): void {
    if (!this.savedRange) {
      textarea.nativeElement.focus();
      this.savedRange = this.selection.getRangeAt(0);
    }
    restoreSelection(this.savedRange, this.selection);
    const placeholderSpan = renderer.createElement('span');
    renderer.setAttribute(placeholderSpan, 'class', `placeholder ${placeholder}`);
    placeholderSpan.innerText = `{${placeholder}}`;
    this.savedRange.insertNode(placeholderSpan);
    this.savedRange.setStartAfter(placeholderSpan);
    this.savedRange.collapse(true);
    restoreSelection(this.savedRange, this.selection);
  }

  insertLink(url: string, newTab: boolean, renderer: Renderer2): void {
    if (this.savedRange && isValidURL(url)) {
      restoreSelection(this.savedRange, this.selection);
      if (newTab) {
        const selectedText: string = this.deleteAndGetElement().trim();

        const newUrl: HTMLElement = renderer.createElement('a');
        renderer.setAttribute(newUrl, 'href', url);
        renderer.setAttribute(newUrl, 'target', '_blank');
        newUrl.innerText = selectedText;
        this.savedRange.insertNode(newUrl);
        this.savedRange.setStartAfter(newUrl);
        this.savedRange.collapse(true);
        restoreSelection(this.savedRange, this.selection);
      } else {
        document.execCommand('createLink', false, url);
      }
    }
  }

  setListColor(range: Range, color: string, renderer: Renderer2): void {
    if (this.selection && range && hasList()) {
      restoreSelection(range, this.selection);
      if (!range.collapsed && isHtmlElement(range.commonAncestorContainer)
        && (range.commonAncestorContainer as HTMLElement).tagName.toUpperCase() === 'UL') {
        this.execute(ExecuteCommands.TEXT_COLOR, color);
        for (let i = 0; i < range.commonAncestorContainer.childNodes.length; i++) {
          renderer.setStyle(range.commonAncestorContainer.childNodes[i], 'color', color);
        }
      } else {
        const text: string = range.toString();
        let target: HTMLElement = range.startContainer.parentElement;
        while (target.tagName.toUpperCase() !== 'LI' && target.parentElement) {
          if (target.hasAttribute('color')) {
            target.setAttribute('color', color);
          }
          target = target.parentElement;
        }
        if (target.innerText === text || text.length === 0) {
          if (target.parentElement.childNodes.length === 1) {
            target = target.parentElement;
          }
          renderer.setStyle(target, 'color', color);
          this.selection.removeAllRanges();
          this.selection.addRange(range);
        } else {
          this.execute(ExecuteCommands.TEXT_COLOR, color);
        }
      }
    }
  }

  setSelectionLinksColor(color: string, range: Range, selection: Selection, renderer: Renderer2): void {
    this.savedRange = range;
    const fragment: DocumentFragment = this.deleteAndGetContent();
    if (fragment && typeof fragment.querySelectorAll === 'function') {
      const links: NodeListOf<Element> = fragment.querySelectorAll('a');
      for (let i = 0; i < links.length; i++) {
        renderer.setStyle(links[i], 'color', color);
      }
    }
    this.savedRange.insertNode(fragment);
    restoreSelection(this.savedRange, selection);
  }

  setFontSize(fontSize: number, renderer: Renderer2, root: HTMLElement): HTMLElement {
    const span: HTMLElement = renderer.createElement('span');
    renderer.setStyle(span, 'fontSize', `${fontSize}px`);
    renderer.setStyle(span, 'lineHeight', `${fontSize}px`);
    restoreSelection(this.savedRange, this.selection);
    if (this.savedRange) {
      const node: Node = this.savedRange.commonAncestorContainer.parentElement;
      let parent: HTMLElement;
      if (isHtmlElement(node)) {
        parent = node as HTMLElement;
      }
      if (parent &&
        (parent.tagName.toUpperCase() === 'UL'
          || parent.tagName.toUpperCase() === 'OL')) {
        renderer.setStyle(parent, 'fontSize', `${fontSize}px`);
        renderer.setStyle(parent, 'lineHeight', `${fontSize}px`);
      } else if (parent &&
        (parent.innerHTML.includes('</ul>')
          || parent.innerHTML.includes('</ol>')
        )) {
        this.execute(ExecuteCommands.FONT_SIZE, '3'); // Temporary size
        const fonts: HTMLCollectionOf<Element> = root.getElementsByTagName('font');
        if (fonts.length) {
          for (let i = 0; i < fonts.length; i++) {
            if (fonts[i].hasAttribute('size')) {
              fonts[i].removeAttribute('size');
              renderer.setStyle(fonts[i], 'fontSize', `${fontSize}px`);
              renderer.setStyle(fonts[i], 'lineHeight', `${fontSize}px`);
            }
          }
        }
        const lis: HTMLCollectionOf<Element> = root.getElementsByTagName('li');
        if (lis.length) {
          for (let i = 0; i < lis.length; i++) {
            lis[i].removeAttribute('size');
            renderer.setStyle(lis[i], 'fontSize', `${fontSize}px`);
            renderer.setStyle(lis[i], 'lineHeight', `${fontSize}px`);
          }
        }
      } else if (parent && !parent.hasAttribute('contenteditable') &&
        (parent.innerText === EMPTY_CHAR ||
          escape(parent.innerText) === ESCAPE_CHAR ||
          compareByChars(parent.innerText, this.savedRange.toString()))
      ) {
        this.cleanNodeChildsFontSize(parent, renderer);
        renderer.setStyle(parent, 'fontSize', `${fontSize}px`);
        renderer.setStyle(parent, 'lineHeight', `${fontSize}px`);
      } else {
        const selectedFragment: DocumentFragment = this.deleteAndGetContent();
        if (selectedFragment && selectedFragment.textContent.length) {
          this.cleanNodeChildsFontSize(selectedFragment, renderer);
          span.appendChild(selectedFragment);
          this.savedRange.insertNode(span);
          this.savedRange.selectNode(span);
        } else {
          span.innerHTML = EMPTY_CHAR;
          this.savedRange.insertNode(span);
          this.savedRange.setStart(span.firstChild, 1);
          this.savedRange.collapse(true);
        }
        restoreSelection(this.savedRange, this.selection);
      }
    }

    return span;
  }

  setCaretToEnd(element: HTMLElement): void {
    if (this.selection) {
      let node: Node = element.lastChild;
      while (node && node.lastChild && node.nodeType !== 3) {
        node = node.lastChild;
      }
      const range: Range = document.createRange();
      range.setStart(node, (node as Text).length);
      range.collapse(true);
      this.selection.removeAllRanges();
      this.selection.addRange(range);
    }
  }

  isActiveElement(): boolean {
    return document.activeElement && document.activeElement.getAttribute('contenteditable') === 'true';
  }

  insertText(text: string, options: TextOptionsInterface, renderer: Renderer2, root: HTMLElement): void {
    let range: Range;
    if (this.selection && this.selection.rangeCount) {
      range = this.selection.getRangeAt(0);
      range.setStart(range.startContainer, range.startOffset - 1);
      let target: Node | HTMLElement = range.endContainer;
      if (options[ExecuteCommands.BOLD] !== undefined) {
        this.execute(ExecuteCommands.BOLD, `${options[ExecuteCommands.BOLD]}`);
        target = range.endContainer;
        if (isHtmlElement(target)) {
          target = target.lastChild;
        }
      }
      if (options[ExecuteCommands.ITALIC] !== undefined) {
        this.execute(ExecuteCommands.ITALIC, `${options[ExecuteCommands.ITALIC]}`);
        target = range.endContainer;
        if (isHtmlElement(target)) {
          target = target.lastChild;
        }
      }
      if (options[ExecuteCommands.UNDERLINE] !== undefined) {
        this.execute(ExecuteCommands.UNDERLINE, `${options[ExecuteCommands.UNDERLINE]}`);
        target = range.endContainer;
        if (isHtmlElement(target)) {
          target = target.lastChild;
        }
      }
      if (options.color) {
        if (hasList()) {
          this.setListColor(range, options.color, renderer);
        } else {
          this.execute(ExecuteCommands.TEXT_COLOR, options.color);
        }
        target = range.endContainer;
        if (isHtmlElement(target)) {
          target = target.lastChild;
        }
      }
      if (options.fontSize) {
        this.savedRange = range;
        target = this.setFontSize(options.fontSize, renderer, root);
        target = target.lastChild;
      }
      while (target.lastChild) {
        target = target.lastChild;
      }
      const textLength: number = (target as Text).length;
      range.setStart(target, textLength === 1 ? 1 : range.startOffset + 1);
      range.setEnd(target, range.startOffset);
      this.selection.removeAllRanges();
      this.selection.addRange(range);
    }
  }

  insertTextAtRange(text: string, range: Range, selection: Selection): void {
    if (!range.collapsed) {
      range.deleteContents();
    }
    if (text.length) {
      const textNode: Node = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse();
    }
    restoreSelection(range, selection);
  }

  isInLastPosition(): boolean {
    return this.savedRange &&
      this.savedRange.endContainer &&
      (this.savedRange.endContainer as Text).length === this.savedRange.endOffset;
  }

  private cleanNodeChildsFontSize(node: DocumentFragment | HTMLElement, renderer: Renderer2): void {
    const styledElements: NodeListOf<Node> =  node.querySelectorAll('[style*="font-size"]');
    for (let i = 0; i <  styledElements.length; i++) {
      renderer.setStyle(styledElements[i], 'fontSize', '');
      renderer.setStyle(styledElements[i], 'lineHeight', '');
    }
  }

  /** delete the text at selected range and return the value */
  private deleteAndGetElement(): string {
    let selectedText: string;

    if (this.savedRange) {
      selectedText = this.savedRange.toString();
      this.savedRange.deleteContents();
    }

    return selectedText;
  }

  private deleteAndGetContent(): DocumentFragment {
    let content: DocumentFragment;
    if (this.savedRange && !this.savedRange.collapsed) {
      content = this.savedRange.cloneContents();
      this.savedRange.deleteContents();
    }

    return content;
  }
}
