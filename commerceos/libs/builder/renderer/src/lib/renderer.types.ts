import { PebLanguage, PebScreen } from '@pe/builder-core';

export interface PebRendererOptions {
  screen: PebScreen;
  scale: number;
  locale: PebLanguage;
  defaultLocale?: PebLanguage;
  interactions: boolean;
  contentDocument?: Document;
  readOnly?: boolean;
  locales?: PebLanguage[];
}
