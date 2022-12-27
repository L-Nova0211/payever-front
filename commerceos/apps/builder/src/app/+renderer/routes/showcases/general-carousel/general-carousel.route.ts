import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'sandbox-renderer-showcase-carousel',
  templateUrl: './general-carousel.route.html',
  styleUrls: ['./general-carousel.route.scss'],
})
export class SandboxRendererShowcaseGeneralCarouselRoute {
  content$ = this.route.data.pipe(
    pluck('content'),
  );

  constructor(private route: ActivatedRoute) {}
}
