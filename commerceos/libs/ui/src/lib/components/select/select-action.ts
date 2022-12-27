import { ChangeDetectionStrategy, Component, HostBinding, HostListener, Input } from '@angular/core';

import { AppThemeEnum, EnvService } from '@pe/common';

import { PebSelectComponent } from './select';
import { SelectService } from './select.service';

@Component({
  selector: 'peb-select-action',
  template: `<span>{{ label }}</span>`,
  styleUrls: ['./option.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectActionComponent {
  isSelected = false;
  isMultiple = false;

  @Input()
  public label: string;
  
  @HostBinding('class.border') border = true;
  
  private select: PebSelectComponent;
  
  private readonly theming = this.envService?.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;
  
  @HostBinding('class') classes = `peb-select-option ${this.theming}`;

  constructor(
    private envService: EnvService,
    private selectService: SelectService
  ) {
    this.select = this.selectService.getSelect();
  }

  @HostListener('click', ['$event'])
  public onClick(event: UIEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
}
