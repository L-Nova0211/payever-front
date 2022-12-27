import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pe-search-list-item',
  templateUrl: './search-list-item.component.html',
  styleUrls: ['./search-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeSearchListItemComponent {

  @Input() public image: string;
  @Input() public removeButtonLabel = null;
  
  @Output() remove = new EventEmitter<void>();

  public readonly isIconImage = (icon: string = ''): boolean => icon.includes('/');
  public readonly isIconXlink = (icon: string = ''): boolean => icon[0] === '#';

  public onRemove(): void {
    this.remove.emit();
  }
}
