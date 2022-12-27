import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'sandbox-renderer-shop-category-showcase-route',
  templateUrl: './shop-category.route.html',
  styleUrls: ['./shop-category.route.scss'],
})
export class SandboxRendererShowcaseShopCategoryRoute {
  content$ = this.route.data.pipe(
    pluck('content'),
  );

  constructor(private route: ActivatedRoute) {}
}
