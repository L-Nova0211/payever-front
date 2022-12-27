import {
  Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, Input, Output,
  EventEmitter, SimpleChanges, OnChanges, ChangeDetectorRef, forwardRef, HostListener,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PeMessageIntegrationSettings } from '@pe/shared/chat';

@Component({
  selector: 'pe-message-appearance-shadow',
  templateUrl: './message-appearance-shadow.component.html',
  styleUrls: ['./message-appearance-shadow.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MessageAppearanceShadowComponent),
    multi: true,
  }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MessageAppearanceShadowComponent implements OnInit, OnChanges, ControlValueAccessor {

  @Input() shadowColor!: string;

  @Output() changed = new EventEmitter<string>();

  showMessageShadow = false;

  @HostListener('touched') onTouch() {
    this.onTouched();
  }

  @HostListener('click') onClick(e: Event) {
    this.onTouched();
  }

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  private onChange = (value: string) => {};
  private onTouched = () => {};

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  writeValue(value: string): void {
    this.initShadow(value);
  }

  ngOnInit(): void {
    this.showMessageShadow = !!this.shadowColor;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.shadowColor) {
      this.initShadow(changes.shadowColor.currentValue);
    }
  }

  initShadow(value: string): void {
    this.shadowColor = value;
    this.showMessageShadow = !!value;

    this.changeDetectorRef.detectChanges();
  }

  disable(): void {
    this.changed.emit(this.showMessageShadow ? PeMessageIntegrationSettings.shadow : '');
    this.shadowColor = this.showMessageShadow ? PeMessageIntegrationSettings.shadow : '';
  }

  change(event: string): void {
    this.onChange(event);
    this.changed.emit(event);
  }
}
