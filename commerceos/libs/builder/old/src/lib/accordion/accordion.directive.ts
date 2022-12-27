import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[pebEditorAccordion]',
})
export class PebEditorAccordionDirective implements AfterViewInit, OnDestroy {
  @Input('pebEditorAccordion') container: ElementRef<HTMLElement>;
  @Input() pebEditorAccordionKey: any;
  @Input() triggerContainer: HTMLElement; // required in case if we want to increase clickable area;
  @Input() showContainerOnInit = false;
  @Input() rotateButton = true; // rotate button (elementRef) after click : true/false
  @Input() rotateDegrees = 90;

  triggerContainerListener: () => void;

  private showContainer = false;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.showContainer = this.showContainerOnInit;
    this.toggleContainerDisplay();
    if (this.triggerContainer) {
      this.triggerContainerListener = this.renderer.listen(
        this.triggerContainer,
        'click',
        () => this.handleClick(),
      );
    }
  }

  ngOnDestroy() {
    this.triggerContainerListener && this.triggerContainerListener();
  }

  toggleContainerDisplay() {
    if (this.container) {
      // TODO: Research there could be no container more deeply
      if (localStorage.getItem(`PEB-SIDEBAR-OPENED-${this.pebEditorAccordionKey}`) === 'true') {
        this.showContainer = true;
      }
      if (!this.showContainer) {
        this.renderer.setStyle(this.container, 'display', 'none');
      } else {
        this.renderer.removeStyle(this.container, 'display');
      }
    }

    if (this.rotateButton) {
      const rotate = this.showContainer && this.rotateDegrees;
      const element = this.elementRef.nativeElement;
      if (rotate) {
        this.renderer.setStyle(element, 'transform', `rotate(${rotate}deg)`);
      } else {
        this.renderer.removeStyle(element, 'transform');
      }
    }
  }

  handleClick() {
    this.showContainer = !this.showContainer;
    localStorage.setItem(`PEB-SIDEBAR-OPENED-${this.pebEditorAccordionKey}`, JSON.stringify(this.showContainer));
    this.toggleContainerDisplay();
  }

  @HostListener('click', ['$event'])
  onClick(e) {
    e.stopPropagation();
    this.handleClick();
  }
}
