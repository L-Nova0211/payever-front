import { ChangeDetectionStrategy, Component } from '@angular/core';
import { capitalize } from 'lodash';

@Component({
  selector: 'sandbox-renderer-route',
  templateUrl: './renderer-root.component.html',
  styleUrls: ['./renderer-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SandboxRendererRootComponent {
  capitalize = capitalize;

  showcases = [
    { id: 'general-basic', name: 'General: Basic' },
    { id: 'general-html', name: 'General: Html' },
    { id: 'general-script', name: 'General: Script' },
    { id: 'general-section', name: 'General: Section' },
    { id: 'general-grid', name: 'General: Grid' },
    { id: 'general-objects', name: 'General: Objects' },
    { id: 'general-button', name: 'General: Button' },
    { id: 'general-line', name: 'General: Line' },
    { id: 'general-carousel', name: 'General: Carousel' },
    { id: 'image', name: 'General: Image' },
    { id: 'video', name: 'General: Video' },
    { id: 'company-logo', name: 'Company: Logo' },
    { id: 'company-navbar', name: 'Company: Menu' },


    { id: 'shop-products', name: 'Shop: Products' },
    { id: 'shop-category', name: 'Shop: Category' },
    { id: 'shop-product-details', name: 'Shop: Product details' },
    { id: 'shop-cart', name: 'Shop: Cart' },
  ];

  performance = ['chess', 'jumper', 'chaotic'];

  constructor() {}
}
