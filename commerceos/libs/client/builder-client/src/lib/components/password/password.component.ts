import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'peb-client-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PebClientPasswordComponent implements OnInit {

  @Input() variant: 'login'|'password'|'other' = null;
  @Output() submitOn = new EventEmitter();
  form: FormGroup;

  constructor(
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      password: new FormControl('', [Validators.required]),
    });
    if (this.variant === 'login') {
      this.form.addControl('login', new FormControl('', [Validators.required]));
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.submitOn.emit({ variant: this.variant, value: this.form.value });
    }
  }

  goBack() {
    this.location.back();
  }
}
