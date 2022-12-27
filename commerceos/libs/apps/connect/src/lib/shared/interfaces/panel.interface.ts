import { InstallationPopupInterface } from './installation-popup.interface';

export interface PanelInterface {
  name: string;
  icon?: string;
  popupList?: InstallationPopupInterface[];
  key?: string;
  active?: boolean;
  option?: string;
  disabled?: boolean;
}
