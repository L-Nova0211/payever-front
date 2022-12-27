import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
} from '@angular/core';

let uniqueId = 0;

export class PebCheckboxChange {
  source: PebCheckboxComponent;
  checked: boolean;
}

@Component({
  selector: 'peb-checkbox',
  exportAs: 'pebCheckbox',
  templateUrl: './checkbox.html',
  styleUrls: ['./checkbox.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebCheckboxComponent implements OnInit {
  inputId = `peb-checkbox-${(uniqueId += 1)}`;

  /** Area label */
  @Input('aria-label') ariaLabel = '';
  /** Area labeled by */
  @Input('aria-labelledby') ariaLabelledby: string | null = null;
  /** Area discribed by */
  @Input('aria-describedby') ariaDescribedby: string;
  /** Checkbox type */
  @Input() type;
  /** Is invalid */
  @Input() isFieldInvalid;
  /** Whether checkbox is required */
  @Input()
  get required(): boolean {
    return this.privateRequired;
  }

  set required(value: boolean) {
    this.privateRequired = coerceBooleanProperty(value);
  }

  constructor(elementRef: ElementRef<HTMLElement>, private cdr: ChangeDetectorRef) {
    elementRef.nativeElement.classList.add('peb-checkbox');
  }

  /** Whether input is checked */
  @Input()
  get checked(): boolean {
    return this.privateChecked;
  }

  set checked(value: boolean) {
    if (value !== this.checked) {
      this.privateChecked = value;
      this.cdr.markForCheck();
    }
  }

  /** Whether input is disbled */
  @Input()
  get disabled() {
    return this.privateDisabled;
  }

  set disabled(value: any) {
    const newValue = coerceBooleanProperty(value);

    if (newValue !== this.disabled) {
      this.privateDisabled = newValue;
      this.cdr.markForCheck();
    }
  }

  /** Binds disbled attribute */
  @HostBinding('attr.disabled') hostAttrDisabled;
  /** Binds checkbox disabled class */
  @HostBinding('class.checkbox-disabled') hostClassDisabled;

  private privateRequired = false;
  private privateChecked = false;
  private privateDisabled = false;

  /** Emits changed value */
  @Output()
  readonly changed: EventEmitter<PebCheckboxChange> = new EventEmitter<PebCheckboxChange>();

  ngOnInit() {
    this.hostAttrDisabled = this.disabled || null;
    this.hostClassDisabled = this.disabled;
  }

  onChange = (_: any) => {};
  onTouched = () => {};

  /** Toggles value */
  toggle(): void {
    this.checked = !this.checked;
  }

  /** On click toggle handler */
  onClick(event) {
    event.preventDefault();

    if (this.disabled) {
      return;
    }

    this.toggle();

    this.emitChangeEvent();
  }

  /** Emits change event */
  private emitChangeEvent() {
    const event = new PebCheckboxChange();
    event.source = this;
    event.checked = this.checked;

    this.onChange(this.checked);
    this.changed.emit(event);
  }

  /** Sets area-checked value */
  getAriaChecked() {
    return `${this.checked}`;
  }
}
