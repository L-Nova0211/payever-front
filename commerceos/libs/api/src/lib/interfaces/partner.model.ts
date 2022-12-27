import { FormFieldInterface } from '@pe/shared/business-form';

export class OnboardingRequestDTO {
  device: string;
  method: string;
  name: string;

  constructor(
    industry: string,
    public country: string,
    app: string,
    fragment: string,
  ) {
    this.device = app;
    this.method = fragment;
    this.name = industry || 'business';
  }
}

export interface OnboardingDTO {
  id:	string;
  name:	string;
  logo:	string;
  type:	string;
  wallpaperUrl:	string;
  afterLogin: ActionDTO[];
  afterRegistration: ActionDTO[];
  accountFlags: any;
  redirectUrl:	string;
  defaultLoginByEmail:	boolean;
  defaultBusinessWallpaper?: string;
  form?: FormFieldInterface[];
}

export interface ActionDTO {
  _id: string;
  method: string;
  name: string;
  url: string;
  orderId: number;
  registerSteps: string[];
  payload: any;
  integration: any;
  priority?: number;
}

export interface WallpaperDataInterface {
  wallpaper: string;
  theme: string;
}
