import { RecommendationTagsEnum } from './recommendation-tags.enum';

export interface RecommendationsInterface {
  tag: RecommendationTagsEnum;
  recommendations: Array<RecommendationsItem>;
}

export interface RecommendationsItem {
  id: string;
  name: string;
  sku?: string;
  images?: string[];
}
