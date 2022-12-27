import { Direction } from '../enums/direction.enum';

export interface Order {
  by: string;
  direction: Direction;
}
