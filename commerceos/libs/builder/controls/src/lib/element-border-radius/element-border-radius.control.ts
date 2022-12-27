import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';


@Component({
  selector: 'peb-editor-controls-element-border-radius',
  template: `<span #tooltip>Radius: {{ radius }} px</span>`,
  styleUrls: ['element-border-radius.control.scss'],
})
export class PebElementBorderRadiusControl {

  @Input() component: any; // PebEditorElement
  @ViewChild('tooltip', { static: false }) tooltip: ElementRef;

  constructor(
    private cdr: ChangeDetectorRef,
  ) {}

  static construct(editor, element) {
    const control = editor.createControl(PebElementBorderRadiusControl);

    control.instance.component = element;
    control.instance.detectChanges();

    return control;
  }

  detectChanges() {
    this.cdr.detectChanges();
  }

  get radius(): string | number {
    return +this.component.styles.borderRadius;
  }

}
