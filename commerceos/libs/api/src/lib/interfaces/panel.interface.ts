export interface PanelInterface {
  name: string;
  icon?: string;
  disabled: boolean;
  switcher?: boolean;
  hasUrl?: boolean;
  adminPanel?: boolean;
}
