import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgControl } from '@angular/forms';

import { RadioControlRegistry } from './radio-control-registry.service';

@Component({
  selector: 'peb-radio',
  templateUrl: './radio.html',
  styleUrls: ['./radio.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioButtonComponent implements OnInit, OnDestroy {
  constructor(public cd: ChangeDetectorRef, private injector: Injector, private registry: RadioControlRegistry) {}
  /** Sets radio button value */
  @Input() value: any;
  /** Sets radio group name */
  @Input() name: string;
  disabled: boolean;
  /** Sets radio button label */
  @Input() label: string;
  @Input() tabindex: number;
  @Input() inputId: string;
  @Input() style: any;
  @Input() styleClass: string;
  @Input() labelStyleClass: string;
  @Input() checked: boolean;

  /** Emits value on click */
  @Output() clicked: EventEmitter<any> = new EventEmitter();
  /** Emits when focused */
  @Output() focusOn: EventEmitter<any> = new EventEmitter();
  /** Emits when blured */
  @Output() blured: EventEmitter<any> = new EventEmitter();

  /** Emits when value changes */
  @Output() changed: EventEmitter<any> = new EventEmitter<any>();
  /** Emits on touched */
  @Output() touched: EventEmitter<any> = new EventEmitter<any>();

  /** Input ref */
  @ViewChild('rb') inputViewChild: ElementRef;
  public focused: boolean;
  control: NgControl;

  ngOnInit() {
    this.control = this.injector.get(NgControl);
    this.registry.add(this.control, this);
  }

  /** Handles click on radio button */
  handleClick(event, rb, focus) {
    event.preventDefault();

    if (this.disabled) {
      return;
    }

    this.select(event);

    if (focus) {
      rb.focus();
    }
  }

  writeValue(v) {}

  select(event) {
    if (!this.disabled) {
      this.changed.emit(this.value);
      this.registry.select(this);

      this.clicked.emit(event);
    }
  }

  /** Focus handler */
  onInputFocus(event) {
    this.focused = true;
    this.focusOn.emit(event);
  }

  /** Blur handler */
  onInputBlur(event) {
    this.focused = false;
    this.touched.emit();
    this.blured.emit(event);
  }

  /** Change handler */
  onChange(event) {
    this.select(event);
  }

  focus() {
    this.inputViewChild.nativeElement.focus();
  }

  ngOnDestroy() {
    this.registry.remove(this);
  }
}
