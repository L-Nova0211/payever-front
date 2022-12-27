import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { EnvService } from '@pe/common';
import { PeGridItem, PeGridItemType } from '@pe/grid';
import { CurrencyPipe, TranslateService } from '@pe/i18n';

import { PEB_SHIPPING_API_PATH } from '../enums/constants';
import { drawText } from '../misc/draw-image';
import { CountriesPipe } from '../pipes/countries.pipe';

@Injectable({ providedIn: 'any' })
export class PebShippingSettingsService {
  private saveProfileSubject = new BehaviorSubject(null);
  profiles = this.saveProfileSubject.asObservable();
  mode = 'adding';

  profilesHelpData: any;

  saveProfile(data: any) {
    this.saveProfileSubject.next(data);
  }

  constructor(
    private http: HttpClient,
    @Inject(PEB_SHIPPING_API_PATH) private shippingApiPath: string,
    private envService: EnvService,
    private countriesPipe: CountriesPipe,
    private currencyPipe: CurrencyPipe,
    private translateService: TranslateService,
  ) {}

  private get businessId() {
    return this.envService.businessId;
  }

  profileToItemMapper = (profile, canvas): PeGridItem => {
    const image = drawText(profile.name, canvas);

    return {
      id: profile._id,
      type: PeGridItemType.Item,
      additionalInfo: this.getShippingAdditionalInfo(profile),
      data: {
        isActive: profile.isDefault,
        isTheme: true,
        application: profile.id,
        type: profile.type,
        condition: profile.isDefault
          ? this.translateService.translate('shipping-app.grid.default')
          : '',
      },
      isDraggable: false,
      itemLoader$: new BehaviorSubject<boolean>(false),
      badge: {
        backgroundColor: profile.isDefault ? '#65646d' : null,
        color: profile.isDefault ? '#fff' : null,
        label: profile.isDefault
          ? this.translateService.translate('shipping-app.grid.default')
          : '',
      },
      title: this.getProfileTitle(profile),
      image: image ?? './assets/icons/folder-grid.png',
      action: {
        label: this.translateService.translate('shipping-app.grid.edit'),
        more: true,
      },
      columns: [
        {
          name: 'name',
          value: 'name',
        },
        {
          name: 'condition',
          value: profile.isDefault
            ? this.translateService.translate('shipping-app.grid.default')
            : '',
        },
        {
          name: 'action',
          value: 'action',
        },
      ],
    };
  }

  zoneToItemMapper = (zone, canvas, getCountryName, currency): PeGridItem => {
    const image = drawText(zone.name, canvas, { width:254, height:144,textX:127,textY:60 });

    return {
      id: zone._id,
      type: PeGridItemType.Item,
      data: {
        flags:this.getIcons(zone),
        isActive: zone.isDefault,
        isTheme: true,
        application: zone.id,
        type: zone.type,
        condition: zone.isDefault
          ? this.translateService.translate('shipping-app.grid.default')
          : '',
      },
      isDraggable: false,
      itemLoader$: new BehaviorSubject<boolean>(false),
      badge: {
        backgroundColor: zone.isDefault ? '#0371e2' : null,
        color: zone.isDefault ? '#fff' : null,
        label: zone.isDefault
          ? this.translateService.translate('shipping-app.grid.default')
          : '',
      },
      title: zone.countryCodes?.length > 1 ? zone.countryCodes.length + ' countries': 
        getCountryName(zone.countryCodes[0]),
      image: image,
      action: {
        label:  this.translateService.translate('shipping-app.grid.edit'),
        more: true,
      },
      columns: [
        {
          name: 'name',
          value: 'name',
        },
        {
          name: 'price',
          value: this.getZonePrice(zone, currency),
        },
        {
          name: 'action',
          value: 'action',
        },
      ],
    };
  }

  getSettings(businessId) {
    return this.http.get(`${this.shippingApiPath}/business/${businessId}/shipping-settings`);
  }

  getProfile(profileId) {
    return this.http.get(
      `${this.shippingApiPath}/business/${this.envService.businessId}/shipping-settings/${profileId}`);
  }
  
  editSettingDefaultOrigin(originId, businessId) {
    const url = `${this.shippingApiPath}/business/${businessId}/shipping-settings/default-origin/${originId}`;

    return this.http.put(url, {});
  }

  addProfile(payload, businessId) {
    const url = `${this.shippingApiPath}/business/${businessId}/shipping-settings`;

    return this.http.post(url, payload);
  }

  editProfile(profileId, payload, businessId) {
    const url = `${this.shippingApiPath}/business/${businessId}/shipping-settings/${profileId}`;

    return this.http.put(url, payload);
  }

  deleteProfile(profileId, businessId) {
    const url = `${this.shippingApiPath}/business/${businessId}/shipping-settings/${profileId}`;

    return this.http.delete(url);
  }

  getShippingAdditionalInfo(profile): string[] {
    const info = [];

    info.push(`${this.translateService.translate('shipping-app.labels.shipping_from')} ${profile?.origins[0]?.countryCode
      ? this.countriesPipe.transform([profile?.origins[0]?.countryCode])
      : ''}
      `);
    info.push(`${profile.products.length} products`);

    return info;
  }

  getProfileTitle(profile) {
    return `${this.translateService.translate('shipping-app.labels.shipping_to')}
              ${profile?.zones && profile?.zones[0]?.countryCodes
      ? (profile?.zones[0]?.countryCodes.length > 1
        ? profile?.zones[0]?.countryCodes.length + ' countries'
        : this.countriesPipe.transform(profile?.zones[0]?.countryCodes))
      : ''} `;
  }

  getZonePrice(zone, currency) {
   return zone?.rates?.length === 1
      ? (zone.rates[0].ratePrice === 0
        ? zone.rates[0].name
        : this.currencyPipe.transform(zone.rates[0].ratePrice, currency, 'symbol'))
      : `${this.translateService.translate('shipping-app.labels.starting_from')}
               ${this.currencyPipe.transform(zone.rates.sort((a, b) => a.ratePrice - b.ratePrice)[0].ratePrice, currency, 'symbol')}
               ${this.translateService.translate('shipping-app.labels.up')}`;
  }

  getIcons(zone):string[]{
    if(!zone?.countryCodes || zone.countryCodes.length == 0 ){
      return []
    }
    else if(zone.countryCodes.length > 3){
      return  ['#icon-shipping-world-white']
    }

    return zone.countryCodes.map((code) => {
        if(code.toLowerCase() == 'all'){
          return  '#icon-shipping-world-white';
        }
        else {
          return `#icon-flag-${code.toLowerCase()}`
        }
    })
  }
}
