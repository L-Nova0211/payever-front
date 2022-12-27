import { OverlayConfig } from '@angular/cdk/overlay';

export interface PebOverlayConfigExtended extends OverlayConfig {
  position?: any;
}

export interface DatePickerConfig extends PebOverlayConfigExtended {
  theme: string;
  config?: {
    headerTitle?: string;
    range?: boolean;
    format?: string;
    maxDate?: Date | null;
    minDate?: Date | null;
    daysToDisable?: number[];
  };
}
