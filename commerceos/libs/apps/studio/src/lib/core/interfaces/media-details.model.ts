import { DirectionsEnum, MediaViewEnum } from '../enums';

export interface MediaDetails {
  media: any;
  mediaView: MediaViewEnum;
  businessId: string;
}

export interface PeStudioPageOptions {
  page?: string;
  limit?: string;
  sort?: {
    order: DirectionsEnum;
    param: string;
  };
}
