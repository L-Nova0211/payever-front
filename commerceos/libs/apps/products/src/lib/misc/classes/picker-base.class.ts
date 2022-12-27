import { Directive, Injector, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';

import { EnvService } from '@pe/common';

import { SectionsService } from '../../product-editor/services';

@Directive()
export class PickerBaseDirective implements OnInit {
  isEdit = false;

  private navigationOptions: NavigationExtras = {
    skipLocationChange: true,
    queryParamsHandling: 'merge',
  };

  protected router: Router = this.injector.get(Router);
  protected route: ActivatedRoute = this.injector.get(ActivatedRoute);
  protected envService: EnvService = this.injector.get(EnvService);
  protected sectionsService: SectionsService = this.injector.get(SectionsService);

  constructor(
    protected injector: Injector
  ) {

  }

  ngOnInit(): void {
    this.isEdit = this.route.snapshot.data.isProductEdit;
  }

  closePicker(): void {
    this.router.navigate(this.getUrl(), this.navigationOptions);
  }

  private getUrl() {
    const baseUrl = [ 'business', this.envService.businessId, 'products', 'list' ];
    const productId = this.route.snapshot.parent.params.productId || null;
    const editor = [ 'products-editor', productId ? 'edit' : 'add' ];

    editor.push(productId);

    return [ ...baseUrl, { outlets: { editor } } ];
  }
}
