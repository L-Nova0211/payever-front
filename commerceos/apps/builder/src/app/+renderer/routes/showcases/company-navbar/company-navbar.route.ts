import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'sandbox-renderer-navbar-component-showcase',
  templateUrl: './company-navbar.route.html',
  styleUrls: ['./company-navbar.route.scss'],
})
export class SandboxRendererShowcaseCompanyNavbarRoute {
  content$ = this.route.data.pipe(
    pluck('content'),
  );

  constructor(private route: ActivatedRoute) {}
}
