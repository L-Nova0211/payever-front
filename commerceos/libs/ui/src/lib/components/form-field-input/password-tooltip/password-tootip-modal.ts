import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  Optional,
  ViewEncapsulation,
} from '@angular/core';

import { PE_PASSWORDTIP_DATA } from '../constants';

@Component({
  selector: 'pe-password-tooltip-modal',
  templateUrl: './password-tootip-modal.html',
  styleUrls: ['./password-tootip-modal.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeTooltipModalComponent implements OnInit {
  passwordList = [
    { label: 'password.tooltip.min_length', value: false },
    { label: 'password.tooltip.letters', value: false },
    { label: 'password.tooltip.number', value: false },
    { label: 'password.tooltip.spec_char', value: false },
  ];

  constructor(@Optional() @Inject(PE_PASSWORDTIP_DATA) public data: any, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.data.subscribe((inputValue: string) => {
      this.passwordList.forEach((item, index) => {
        this.passwordList[index].value = false;
      });

      if (inputValue.length >= 8) {
        this.passwordList[0].value = true;
      }

      if (inputValue.match(/[A-Z]/) && inputValue.match(/[a-z]/)) {
        this.passwordList[1].value = true;
      }

      if (inputValue.match(/\d/)) {
        this.passwordList[2].value = true;
      }

      if (inputValue.match(/[!@#$%^&*(),.?":{}|<>]/)) {
        this.passwordList[3].value = true;
      }

      this.cdr.detectChanges();
    });
  }
}
