import { group } from '@angular/animations';
import { Injectable } from '@angular/core';

import { BusinessInterface } from '@pe/business';
import { SearchGroupItems, SpotlightSearch } from '@pe/common';
import { MediaContainerType, MediaUrlPipe } from '@pe/media';

import { mapSpotlightSearch } from '../components/models/search.models';
import { BusinessSpotlightInterface } from '../components/models/user.model';
import { SearchGroupEnum } from '../enums/search-group.enum';

@Injectable()
export class SearchBoxService {
  public readonly MaxResults: number = 10;
  private _businesses: BusinessInterface[] = [];

  constructor(private mediaUrlPipe: MediaUrlPipe) { }

  getGroups(data: SearchGroupItems[], businessId?: string): SpotlightSearch[] {
    const groupedData = data.reduce((pre, curr) => {
      pre[curr.app] = [...pre[curr.app] || [], curr]

      return pre;
     }, {});

    const mappedData = Object.keys(groupedData)
        .map((appName: string) => {
          return appName === SearchGroupEnum.Businesses ? 
            this.setupBusinesses(groupedData[appName])
            : mapSpotlightSearch(appName, groupedData[appName] || [], businessId);
        })
        .filter(searchData => 
          searchData != null  
          && searchData.items 
          && searchData.items.some((item: any) => item.title)
        );

    const limit: number = mappedData.length === 1 ? this.MaxResults : 5;

    return mappedData.map(
      (group: any) => {
        return {
          heading: group.heading,
          items: group.items.slice(0, limit),
        };
      }
    ).sort((item1: SpotlightSearch, item2: SpotlightSearch) => {
      if (item2.heading === SearchGroupEnum.Businesses) {
        return 1;
      }

      if (item1.heading === SearchGroupEnum.Businesses) {
        return -1;
      }

      return item1.heading > item2.heading ? 1 : -1;
    });
  }

  private setupBusinesses(businessSpotlightInterface: BusinessSpotlightInterface[]): any {
    this._businesses = [];

    this._businesses = businessSpotlightInterface.map((business: BusinessSpotlightInterface) => {

      const name: string[] = business.owner?.fullName?.split(' ');

      return {
        ...business,
        _id: business._id,
        email: business.owner?.email,
        name: business.title,
        firstName: name && name?.length > 0 ? name[0] : '',
        lastName: name && name?.length > 1 ? name[1] : '',
        logo: business.icon ? this.mediaUrlPipe.transform(business.icon, MediaContainerType.Images) : '',
        userId: business.ownerId,
        city: business.description,
      } as any;
    });

  
    return this._businesses.length > 0 ? 
      this._getSearchBusinessObject(this._businesses)
      : null;
  }

  private _getSearchBusinessObject(businesses: BusinessInterface[]): any {
    return {
      heading: SearchGroupEnum.Businesses,
      items: businesses.map((business: BusinessInterface) => ({
        ...business,
        title: business.name,
        description: '',
        imageIconSrc: business.logo,
        id: business._id,
        email: business.email || '',
        url: [`business`, business._id, `info`, `overview`],
      })),
    };
  }
}