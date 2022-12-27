export interface PePlatformHeader {
    data: any;
}

export interface PePlatformHeaderConfig {
    isHidden?: boolean;
    isShowSubheader?: boolean;
    mainDashboardUrl?: string;
    currentMicroBaseUrl?: string;
    isShowShortHeader?: boolean;
    isShowDataGridToggleComponent?: boolean;
    showDataGridToggleItem?: PePlatformHeaderItem;
    mainItem?: PePlatformHeaderItem;
    isShowMainItem?: boolean;
    closeItem?: PePlatformHeaderItem;
    isShowCloseItem?: boolean;
    businessItem?: PePlatformHeaderItem;
    isShowBusinessItem?: boolean;
    isShowBusinessItemText?: boolean;
    shortHeaderTitleItem?: PePlatformHeaderItem;
    shortHeaderLeftMenuItems?: PePlatformHeaderItem[];
    shortHeaderRightMenuItems?: PePlatformHeaderItem[];
    leftSectionItems?: PePlatformHeaderItem[];
    rightSectionItems?: PePlatformHeaderItem[];
    mobileSidenavItems?: PeMobileSidenavItem[];
    isShowMobileSidenavItems?: boolean;
}

export interface PeMobileSidenavItem {
  name: string;
  active: boolean;
  item: PePlatformHeaderItem;
}

export interface PePlatformHeaderItem {
    title?: string;
    icon?: string;
    iconSize?: string;
    iconDimensions?: {
      width: string;
      height: string
    };
    class?: string;
    iconType?: 'vector' | 'raster';
    children?: PePlatformHeaderMenuItem[];
    onClick?: any;
    isActive?: boolean;
    isLoading?: boolean;
    notifications?: string;
    showIconBefore?: boolean;
}

export interface PePlatformHeaderMenuItem {
    title?: string;
    icon?: string;
    iconSize?: string;
    iconType?: 'vector' | 'raster';
    onClick?: any;
}
