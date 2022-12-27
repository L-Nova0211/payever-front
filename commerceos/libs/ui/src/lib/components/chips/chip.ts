import { Component, Input } from '@angular/core';

@Component({
  selector: 'peb-chip',
  templateUrl: './chip.html',
  styleUrls: ['./chip.scss'],
})
export class PebChipComponent {
  @Input() value: any;
}
