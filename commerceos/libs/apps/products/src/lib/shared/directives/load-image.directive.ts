import { Directive, ElementRef, Input, OnInit } from '@angular/core';


@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[loadImage]',
})

export class LoadImageDirective implements OnInit {

  @Input('loadImage') src: string;

  constructor(
    private element: ElementRef,
  ) {
  }

  public ngOnInit(): void {
    (this.element.nativeElement as HTMLImageElement).src = this.src;
  }

}
