export interface SnackbarConfig {
  content: string;
  duration: number; // TODO: remove legacy
  boldContent?: string;
  hideButtonTitle?: string;
  hideCallback?: () => any;
  hideButtonColor?: string;
  useShowButton?: boolean;
  showButtonTitle?: string;
  showButtonAction?: () => any;
  iconId?: string;
  iconSize?: number;
  iconColor?: string;
  pending?: boolean;
}
