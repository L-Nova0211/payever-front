import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EnvService } from '@pe/common';
import { AppThemeEnum, MessageBus } from '@pe/common';

@Component({
  selector: 'peb-blog-themes',
  templateUrl: './blog-themes.component.html',
  styleUrls: ['./blog-themes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebBlogThemesComponent {
  theme = this.envService.businessData?.themeSettings?.theme ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default

  constructor(
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    private envService: EnvService,

  ) {
  }

  onThemeInstalled() {
    this.messageBus.emit('blog.navigate.edit', this.route.snapshot.params.blogId);
  }

}
