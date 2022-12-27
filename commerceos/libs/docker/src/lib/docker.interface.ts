export interface DockerItemInterface {
  icon: string;
  title: string;
  code?: string;
  count?: number;
  active?: boolean;
  installed?: boolean;
  setupStatus?: 'notStarted' | 'completed'
  onSelect?(active: boolean): void;
}
