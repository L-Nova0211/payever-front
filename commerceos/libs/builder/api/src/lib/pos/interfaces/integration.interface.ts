import { IntegrationCategory } from '../enums/integration-category.enum';

export interface IntegrationInfoInterface {
  _id: string;
  installed: boolean;
  integration: {
    name: string;
    category: IntegrationCategory;
    displayOptions: {
      icon: string;
      title: string;
      order?: number;
    };
  };
}

export interface IntegrationConnectInfoInterface {
  _id: string;
  name: string;
  enabled: boolean;
  category: IntegrationCategory;
  timesInstalled: number;
  ratingsPerRate: [];
  ratingsCount: number;
  avgRating: number;
  extension?: {
    formAction: {
      endpoint: string;
      method: string;
    };
    url: string;
  };
}
