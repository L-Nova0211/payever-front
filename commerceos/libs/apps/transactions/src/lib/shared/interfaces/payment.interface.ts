export interface PaymentInterface {
  amount?: number;
  created_at?: string;
  down_payment?: number;
  id?: string;
  notice_url?: string;
  payment_flow_id?: string;
  payment_option_id?: number;
  reference?: string;
  remember_me?: boolean;
  shop_redirect_enabled?: boolean;
  store_name?: string;
  total?: number;
  payment_details?: any;
}
