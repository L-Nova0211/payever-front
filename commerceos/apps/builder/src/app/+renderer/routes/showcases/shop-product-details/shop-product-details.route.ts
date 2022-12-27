import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'sandbox-renderer-shop-product-details-showcase-route',
  templateUrl: './shop-product-details.route.html',
  styleUrls: ['./shop-product-details.route.scss'],
})
export class SandboxRendererShowcaseShopProductDetailsRoute {
  content$ = this.route.data.pipe(
    pluck('content'),
  );

  constructor(private route: ActivatedRoute) {}
}
