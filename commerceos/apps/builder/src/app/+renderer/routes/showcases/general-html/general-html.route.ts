import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'sandbox-renderer-showcase-html-route',
  templateUrl: './general-html.route.html',
  styleUrls: ['./general-html.route.scss'],
})
export class SandboxRendererShowcaseGeneralHtmlRoute {
  content$ = this.route.data.pipe(
    pluck('content'),
  );

  constructor(private route: ActivatedRoute) { }
}
