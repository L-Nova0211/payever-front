import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessInterface, BusinessState } from '@pe/business';
import { AppThemeEnum } from '@pe/common';

@Injectable()
export class SearchOverlayService {
    @SelectSnapshot(BusinessState.businessData) businessData:BusinessInterface
    overlayRef
    searchText: string;
    theme: AppThemeEnum;
    constructor(
        private overlay: Overlay,
    ) {
    }

    open(component, searchText?: string) {
        this.theme = (this.businessData?.themeSettings?.theme) 
            ? AppThemeEnum[this.businessData?.themeSettings?.theme] 
            : AppThemeEnum.default;

        const searchPortal = new ComponentPortal(component);
        this.searchText = searchText||''

        let config = new OverlayConfig({
            panelClass: ['search-overlay', this.theme],
            hasBackdrop: true,
            backdropClass: `cdk-overlay-${this.theme}-backdrop`,
            disposeOnNavigation: true,
        });
        this.overlayRef = this.overlay.create(config);
        this.overlayRef.attach(searchPortal);
        this.overlayRef.backdropClick().subscribe(() => this.overlayRef.detach());
    }

    close(){
        this.overlayRef.detach()        
    }
}