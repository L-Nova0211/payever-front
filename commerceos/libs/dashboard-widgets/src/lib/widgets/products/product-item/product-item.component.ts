import { ChangeDetectionStrategy, Component, Input, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, args: string[]): string {
    const limit = args.length > 0 ? parseInt(args[0], 10) : 10;
    const trail = args.length > 1 ? args[1] : '...';

    return value.length > limit ? value.substring(0, limit) + trail : value;
  }
}

@Component({
  selector: 'product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductItemComponent {
  @Input() small: boolean;
  @Input() imageSrc: string;
  @Input() title: string;
  @Input() price: number;
  @Input() currency: string;
  @Input() lastBuy: string;
  @Input() quantity: number;
  @Input() loading: boolean;

  get titlePart1(): string {
    return String(this.title).split(' ')[0];
  }

  get titlePart2(): string {
    return String(this.title).split(' ').slice(1).join(' ');
  }
}
