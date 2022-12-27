import { RecommendationTagsEnum } from '../enums/recommendation-tags.enum';

export interface RecommendationsInterface {
  tag: RecommendationTagsEnum;
  recommendations: RecommendationsItem[];
}

export interface RecommendationsItem {
  id: string;
  name: string;
  sku?: string;
  images?: string[];
}
