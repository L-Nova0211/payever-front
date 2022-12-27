import { TranslationTemplateArgs } from '@pe/i18n';

export interface SubdashboardHeaderButtonInterface {
  label: string;
  labelTranslationArgs?: TranslationTemplateArgs;
  className?: string;
  onClick(evt: MouseEvent): void;
}

export interface SubdashboardHeaderDropdownItemInterface {
  label: string;
  labelTranslationArgs?: TranslationTemplateArgs;
  onClick(evt: MouseEvent): void;
}
