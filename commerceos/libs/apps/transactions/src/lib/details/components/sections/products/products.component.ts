import { ChangeDetectionStrategy, Component, Inject, Injector } from '@angular/core';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { MediaContainerType, MediaUrlPipe } from '@pe/media';

import { BaseSectionClass } from '../../../../classes/base-section.class';

@Component({
  selector: 'pe-products-section',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  providers: [
    MediaUrlPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ProductsSectionComponent extends BaseSectionClass {

  constructor(
    protected injector: Injector,
    private mediaUrlPipe: MediaUrlPipe,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {
    super(injector);
  }

  get fallbackImage(): string {
    return `${this.env.custom.cdn}/images/fallback.png`;
  }

  productImage(imgUrl: string) {
    return this.mediaUrlPipe.transform(imgUrl, MediaContainerType.Products);
  }
}
