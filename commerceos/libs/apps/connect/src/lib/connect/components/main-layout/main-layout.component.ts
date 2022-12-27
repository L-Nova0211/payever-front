import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'connect-main-layout',
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit  {

  ngOnInit(): void {
    (window as any)?.PayeverStatic?.IconLoader?.loadIcons([
      'set',
      'apps',
      'social',
    ]);
  }

}
