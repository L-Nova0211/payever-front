export enum PeAffiliatesRequestsErrorsEnum {
  // Connections
  GetConnections = 'affiliates-app.apm_errors.get_connections',
  InstallConnection = 'affiliates-app.apm_errors.install_connection',
  UninstallConnection = 'affiliates-app.apm_errors.uninstall_connection',
  // Access
  GetAccessConfig = 'affiliates-app.apm_errors.get_access_config',
  GetLiveStatus = 'affiliates-app.apm_errors.get_live_status',
  UpdateAccessConfig = 'affiliates-app.apm_errors.update_access_config',
  // Themes
  GetShopActiveTheme = 'affiliates-app.apm_errors.get_shop_active_theme',
  NoApplicationId = 'affiliates-app.apm_errors.no_application_id',
  // Bank accounts
  GetBankAccounts = 'affiliates-app.apm_errors.get_bank_accounts',
  CreateBankAccount = 'affiliates-app.apm_errors.create_bank_account',
  DeleteBankAccount = 'affiliates-app.apm_errors.delete_bank_account',
  UpdateBankAccount = 'affiliates-app.apm_errors.update_bank_account',
  // Sales networks
  GetSalesNetwork = 'affiliates-app.apm_errors.get_sales_network',
  GetSalesNetworks = 'affiliates-app.apm_errors.get_sales_networks',
  CreateSalesNetwork = 'affiliates-app.apm_errors.create_sales_network',
  DeleteSalesNetwork = 'affiliates-app.apm_errors.delete_sales_network',
  UpdateSalesNetwork = 'affiliates-app.apm_errors.update_sales_network',
  GetDefaultSalesNetwork = 'affiliates-app.apm_errors.get_default_sales_network',
  SetDefaultSalesNetwork = 'affiliates-app.apm_errors.set_default_sales_network',
  // Programs
  GetAllPrograms = 'affiliates-app.apm_errors.get_all_programs',
  GetProgramsBySalesNetwork = 'affiliates-app.apm_errors.get_programs_by_sales_network',
  GetProgram = 'affiliates-app.apm_errors.get_program',
  CreateProgram = 'affiliates-app.apm_errors.create_program',
  DeleteProgram = 'affiliates-app.apm_errors.delete_program',
  UpdateProgram = 'affiliates-app.apm_errors.update_program',
  // Program applies to
  GetCategories = 'affiliates-app.apm_errors.get_categories',
  GetProducts = 'affiliates-app.apm_errors.get_products',
  // Affiliates
  GetAffiliatesList = 'affiliates-app.apm_errors.get_affiliates_list',
  CreateAffiliate = 'affiliates-app.apm_errors.create_affiliate',
  DeleteAffiliate = 'affiliates-app.apm_errors.delete_affiliate',
  UpdateAffiliate = 'affiliates-app.apm_errors.update_affiliate',
  ValidateAffiliateName = 'affiliates-app.apm_errors.validate_affiliate_name',
  GetAffiliatePreview = 'affiliates-app.apm_errors.get_affiliate_preview',
  GetCurrentAffiliatePreview = 'affiliates-app.apm_errors.get_current_affiliate_preview',
  // Payments
  GetPayments = 'affiliates-app.apm_errors.get_payments',
  CreatePayments = 'affiliates-app.apm_errors.create_payments',
  UpdatePayments = 'affiliates-app.apm_errors.update_payments',
}
