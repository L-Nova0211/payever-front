import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'pe-auth-code',
  templateUrl: './auth-code.html',
  styleUrls: ['./auth-code.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeAuthCodeComponent implements OnInit {
  /** Sets number of digits */
  @Input() set numberOfDigits(value: number) {
    this.digitFormArray.reset([]);
    for (let i = 0; i < value; i += 1) {
      this.digitFormArray.push(new FormControl(''));
    }
  }

  @Input() type = 'text';

  /** Digits array */
  digitFormArray = this.fb.array([]);

  /** Emits value when changed */
  @Output() readonly changed: EventEmitter<string> = new EventEmitter<string>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.digitFormArray.valueChanges.subscribe((values) => {
      this.changed.emit(values.join(''));
    });
  }

  /** Replaces non number characters with '' */
  numberOnly(event, inputIndex) {
    this.digitFormArray.controls[inputIndex].patchValue(event.target.value.replace(/[^0-9]/gi, ''), {
      emitEvent: false,
    });
  }
}
