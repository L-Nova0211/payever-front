import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';

const BUTTON_HOST_ATTR = ['pe-form-button', 'peb-button', 'peb-text-button'];

@Component({
  selector: `button[pe-form-button], button[peb-button], button[peb-text-button]`,
  exportAs: 'pebButton',
  templateUrl: './button.html',
  styleUrls: ['./button.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebButtonComponent implements OnInit {
  /** Sets button color */
  @Input() color: string;

  /** Whether button is disabled */
  @Input() disabled;

  /** Binds disabled attribute */
  @HostBinding('attr.disabled') hostAttrDisabled;
  /** Binds disabled class */
  @HostBinding('class.button-disabled') hostClassDisabled;

  constructor(public elementRef: ElementRef) {
    for (const attr of BUTTON_HOST_ATTR) {
      if (this.getHostAttributes(attr)) {
        this.getHostElement().classList.add(attr);
      }
    }

    elementRef.nativeElement.classList.add('peb-base-button');
  }

  ngOnInit() {
    if (typeof this.color !== 'undefined') {
      if (this.getHostElement().hasAttribute('peb-text-button')) {
        this.getHostElement().classList.add(`text-${this.color.toLowerCase()}`);
      } else {
        this.getHostElement().classList.add(this.color.toLowerCase());
      }
    }

    this.hostAttrDisabled = this.disabled || null;
    this.hostClassDisabled = this.disabled;
  }

  /** Gets host element ref */
  private getHostElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  /** Gets host element attributes */
  private getHostAttributes(...attributes: string[]) {
    return attributes.some(attribute =>
      this.getHostElement().hasAttribute(attribute),
    );
  }
}
