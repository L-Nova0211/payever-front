import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: `input[pebInput]`,
})
export class PebInputDirective implements OnInit {
  constructor(private elRef: ElementRef<HTMLElement>, private control: NgControl, private renderer: Renderer2) {}

  ngOnInit() {
    this.control.control.statusChanges.subscribe(status => {
      if (status === 'DISABLED') {
        this.renderer.addClass(this.elRef.nativeElement, 'input-disabled');
      } else {
        this.renderer.removeClass(this.elRef.nativeElement, 'input-disabled');
      }
    });
  }
}
