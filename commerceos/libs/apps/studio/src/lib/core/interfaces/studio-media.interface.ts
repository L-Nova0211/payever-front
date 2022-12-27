import { PeStudioCategory } from './studio-category.interface';

export interface PeStudioMedia {
  album: string;
  albumName: string;
  _id: string;
  business: any;
  url: string;
  category: PeStudioCategory;
  createdAt: string;
  mediaType: string;
  name: string;
  updatedAt: string;
  description: string;
}
