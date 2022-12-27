import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'sandbox-renderer-shop-products-showcase-route',
  templateUrl: './shop-products.route.html',
  styleUrls: ['./shop-products.route.scss'],
})
export class SandboxRendererShowcaseShopProductsRoute {
  content$ = this.route.data.pipe(
    pluck('content'),
  );

  constructor(private route: ActivatedRoute) {}
}
