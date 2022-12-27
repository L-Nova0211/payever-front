import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

const bodyClass = 'pe-products-app';

@Component({
  selector: 'lib-products',
  template: `
    <div [style.height.%]='100' class='products-container'>
      <router-outlet></router-outlet>
      <router-outlet name="editor"></router-outlet>
    </div>
  `,
  styleUrls: ['./products.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductsComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(DOCUMENT) private document: any, // Document
  ) {
  }

  ngOnInit() {
    this.document.body.classList.add(bodyClass);
  }

  ngOnDestroy() {
    this.document.body.classList.remove(bodyClass)
  }
}
