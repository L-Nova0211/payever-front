export enum PeSubscriptionsRequestsErrorsEnum {
  // Connections
  GetConnections = 'subscriptions-app.apm_errors.get_connections',
  InstallConnection = 'subscriptions-app.apm_errors.install_connection',
  UninstallConnection = 'subscriptions-app.apm_errors.uninstall_connection',
  // Access
  GetAccessConfig = 'subscriptions-app.apm_errors.get_access_config',
  GetLiveStatus = 'subscriptions-app.apm_errors.get_live_status',
  UpdateAccessConfig = 'subscriptions-app.apm_errors.update_access_config',
  // Themes
  GetShopActiveTheme = 'subscriptions-app.apm_errors.get_shop_active_theme',
  NoApplicationId = 'subscriptions-app.apm_errors.no_application_id',
  // Subscriptions networks
  GetNetwork = 'subscriptions-app.apm_errors.get_network',
  GetNetworks = 'subscriptions-app.apm_errors.get_networks',
  CreateNetwork = 'subscriptions-app.apm_errors.create_network',
  DeleteNetwork = 'subscriptions-app.apm_errors.delete_network',
  UpdateNetwork = 'subscriptions-app.apm_errors.update_network',
  GetDefaultNetwork = 'subscriptions-app.apm_errors.get_default_network',
  SetDefaultNetwork = 'subscriptions-app.apm_errors.set_default_network',
  // Programs
  GetAllPlans = 'subscriptions-app.apm_errors.get_all_plans',
  GetPlan = 'subscriptions-app.apm_errors.get_plan',
  GetPlanByNetwork = 'subscriptions-app.apm_errors.get_plan_by_network',
  CreatePlan = 'subscriptions-app.apm_errors.create_plan',
  UpdatePlan = 'subscriptions-app.apm_errors.update_plan',
  DeletePlan = 'subscriptions-app.apm_errors.delete_plan',
  // Plan applies to
  GetCategories = 'subscriptions-app.apm_errors.get_categories',
  GetProducts = 'subscriptions-app.apm_errors.get_products',
  // Plan eligibility
  GetSubscribers = 'subscriptions-app.apm_errors.get_subscribers',
  GetSubscribersGroups = 'subscriptions-app.apm_errors.get_subscribers_groups',
  GetSubscribersOfGroup = 'subscriptions-app.apm_errors.get_subscribers_of_group',
}
