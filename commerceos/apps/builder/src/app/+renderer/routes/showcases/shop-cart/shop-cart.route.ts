import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'sandbox-renderer-shop-cart-showcase-route',
  templateUrl: './shop-cart.route.html',
  styleUrls: ['./shop-cart.route.scss'],
})
export class SandboxRendererShowcaseShopCartRoute {
  content$ = this.route.data.pipe(
    pluck('content'),
  );

  constructor(private route: ActivatedRoute) {}
}
