export interface PeProfileCardInterface {
  name?: string;
  uuid?: string;
  logo: string;
  leftControl?: ProfileControlInterface;
  rightControl?: ProfileControlInterface;
  _id?: string;
}

export interface PeProfileCardConfigInterface {
  cardTitle?: string;
  type?: ProfileCardType;
  cardButtonText?: string;
  images?: string[];
  placeholderTitle?: string;
  onCardButtonClick?: () => void;
}

export interface ProfileControlInterface {
  type: ProfileControlType;
}

export interface ProfileButtonControlInterface extends ProfileControlInterface {
  title: string;
  onClick: () => void;
}

export interface ProfileMenuControlInterface extends ProfileControlInterface {
  icon: string;
  menuItems: ProfileMenuItemControlInterface[];
}

export interface ProfileMenuItemControlInterface {
  title: string;
  onClick: () => void;
}

export enum ProfileCardType {
  Personal = 'Personal',
  Business = 'Business',
  App = 'App',
}

export enum ProfileControlType {
  Button = 'button',
  Menu = 'menu',
}
