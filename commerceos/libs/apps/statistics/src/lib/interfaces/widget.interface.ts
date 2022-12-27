export interface WidgetInterface {
  id: number;
  account_connection?: number;
  configuration_type?: string;
  data: any;
  default_settings?: any;
  filters?: any;
  image_url?: string;
  is_configured: boolean;
  name: string;
  options?: any;
  settings: any[];
  settingsHash?: {[id: string]: any};
  title: any;
  type: 'rough_chart' | 'chart_list' | 'ratio_chart' | 'item_list' | 'user_list' | 'doughnut_chart' | 'bar_chart';
  loading: boolean;
}
