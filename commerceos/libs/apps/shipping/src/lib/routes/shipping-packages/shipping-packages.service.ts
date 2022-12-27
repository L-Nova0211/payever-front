import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { EnvService, AppThemeEnum } from '@pe/common';
import { PeGridItem, PeGridItemType } from '@pe/grid';
import { TranslateService } from '@pe/i18n';

import { PEB_SHIPPING_API_PATH } from '../../enums/constants';
import { PackageTypeEnum } from '../../enums/PackageTypeEnum';
import { BaseComponent } from '../../misc/base.component';
import { drawText } from '../../misc/draw-image';
import { ProductsApiService } from '../shipping-profiles/browse-products/services/api.service';

@Injectable({ providedIn: 'any' })
export class PebShippingPackagesService extends BaseComponent {
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  fileName = 'package-icon.png';
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  constructor(
    private http: HttpClient,
    private envService: EnvService,
    protected translateService: TranslateService,
    private apiService: ProductsApiService,
    @Inject(PEB_SHIPPING_API_PATH) private shippingApiPath: string,
  ) {
    super(translateService);
  }

  boxToItemMapper = (box, canvas): PeGridItem => {
    const image = drawText(box.name, canvas);

    return {
      id: box._id,
      type: PeGridItemType.Item,
      additionalInfo: this.getAdditionalInfo(box),
      data: {
        isActive: box.isDefault,
        isTheme: true,
        application: box.id,
        type: box.type,
        condition: box.isDefault
          ? this.translateService.translate('shipping-app.grid.default')
          : '',
      },
      isDraggable: false,
      itemLoader$: new BehaviorSubject<boolean>(false),
      badge: {
        backgroundColor: box.isDefault ? '#65646d' : null,
        color: box.isDefault ? '#fff' : null,
        label: box.isDefault
          ? this.translateService.translate('shipping-app.grid.default')
          : '',
      },
      title: box.name,
      image: image ?? './assets/icons/folder-grid.png',
      action: {
        label: this.translateService.translate('shipping-app.grid.edit'),
        backgroundColor: '#65646d',
        color: '#fff',
        more: true
      },
      columns: [
        {
          name: 'name',
          value: 'name',
        },
        {
          name: 'condition',
          value: box.isDefault
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

  getAdditionalInfo(box) {
    return [`${box.width}
             ${box.type === PackageTypeEnum.Envelope ? '' : 'x ' + box.height} x
             ${box.length} ${box.dimensionUnit}, ${box.weight} ${box.weightUnit}`];
  }

  getPackages(businessId, type: string) {
    const baseUrl = `${this.shippingApiPath}/business/${businessId}/shipping-box`;

    return this.http.get(baseUrl).pipe(
      map((box: any) => {
        return box.filter((box) => {
          return box.type === type;
        });
      }),
    );
  }
}
