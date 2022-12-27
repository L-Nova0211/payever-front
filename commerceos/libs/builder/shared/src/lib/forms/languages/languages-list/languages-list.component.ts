import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'peb-languages-list',
  templateUrl: './languages-list.component.html',
  styleUrls: ['./languages-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguagesListComponent {

  @Input() options: Array<{ title: string, value: any }> = [];
  @Output() selected: EventEmitter<string> = new EventEmitter<string>();

  onSelect(title: string) {
    this.selected.emit(title);
  }

}
