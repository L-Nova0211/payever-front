import { ActionInterface, ActionButtonInterface } from './action-button.interface';

export enum PeListCellType {
  Text = 'text',
  Button = 'button',
  Toggle = 'toggle',
}

interface PeListCellBasicInterface {
  classes?: string;
}

export interface PeListCellValueInterface extends PeListCellBasicInterface {
  type: PeListCellType.Text;
  value: string;
}

export interface PeListCellButtonInterface extends PeListCellBasicInterface, ActionButtonInterface {
  type: PeListCellType.Button;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: boolean;
  color?: string;
}

export interface PeListCellToggleInterface extends PeListCellBasicInterface {
  type: PeListCellType.Toggle;
  actionToggleOn: ActionInterface;
  actionToggleOff: ActionInterface;
  checked: boolean;
}

export type PeListCellInterface = PeListCellValueInterface | PeListCellButtonInterface | PeListCellToggleInterface;
export type PeListInterface = PeListCellInterface[][];
