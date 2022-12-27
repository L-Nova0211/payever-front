export interface PeListSectionIntegrationInterface {
  _id?: string;
  abbreviation?: string;
  category?: string;
  component?: any;
  description?: string; 
  disabled?: boolean;
  enabled?: boolean;
  icon: string;
  iconColor?: string;
  indexes?: number[];
  maxlength?: number;
  mediaRules?: any;
  showDescription?: boolean;
  title: string;
  toggleLabel?: string;
  warning?: string;
  wasPosted?: boolean; 
}
