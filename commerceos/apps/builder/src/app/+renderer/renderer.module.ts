import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Routes } from '@angular/router';

import { PebRendererModule } from '@pe/builder-renderer';

import { SandboxRendererRootComponent } from './routes/_root/renderer-root.component';
import { SandboxRendererPerfomanceChessRoute } from './routes/performance/chess/chess.route';
import { SandboxRendererPerformanceJumperRoute } from './routes/performance/jumper/jumper.route';
import { SandboxRendererPerformanceRoute } from './routes/performance/performance.route';
import { SandboxRendererShowcaseRoute } from './routes/showcases/_TR old-root/showcase.route';
import { SandboxRendererShowcaseCompanyNavbarRoute } from './routes/showcases/company-navbar/company-navbar.route';
import { SandboxRendererShowcaseContentResolver } from './routes/showcases/content.resolver';
import { SandboxRendererShowcaseGeneralBasicRoute } from './routes/showcases/general-basic/general-basic.route';
import { SandboxRendererShowcaseGeneralButtonRoute } from './routes/showcases/general-button/general-button.route';
import { SandboxRendererShowcaseGeneralCarouselRoute } from './routes/showcases/general-carousel/general-carousel.route';
import { SandboxRendererShowcaseGeneralHtmlRoute } from './routes/showcases/general-html/general-html.route';
import { SandboxRendererShowcaseGeneralLineRoute } from './routes/showcases/general-line/general-line.route';
import { SandboxRendererShowcaseGeneralObjectsRoute } from './routes/showcases/general-objects/general-objects.route';
import { SandboxRendererShowcaseGeneralScriptRoute } from './routes/showcases/general-script/general-script.route';
import { SandboxRendererShowcaseGeneralImageRoute } from './routes/showcases/image/image.route';
import { SandboxRendererShowcaseShopCartRoute } from './routes/showcases/shop-cart/shop-cart.route';
import { SandboxRendererShowcaseShopCategoryRoute } from './routes/showcases/shop-category/shop-category.route';
import { SandboxRendererShowcaseShopProductDetailsRoute } from './routes/showcases/shop-product-details/shop-product-details.route';
import { SandboxRendererShowcaseShopProductsRoute } from './routes/showcases/shop-products/shop-products.route';
import { SandboxRendererShowcaseGeneralVideoRoute } from './routes/showcases/video/video.route';
import { SandboxPerformanceStatsComponent } from './shared/performance-stats/performance-stats.component';
import { SandboxRendererPreviewComponent } from './shared/preview/preview.component';
import { SandboxRendererSettingsPanelComponent } from './shared/settings-panel/settings-panel.component';

const routes: Routes = [
  {
    path: '',
    component: SandboxRendererRootComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'showcases/general-basic',
      },
      {
        path: 'showcases/general-basic',
        component: SandboxRendererShowcaseGeneralBasicRoute,
        resolve: {
          content: SandboxRendererShowcaseContentResolver,
        },
      },
      {
        path: 'showcases/general-objects',
        component: SandboxRendererShowcaseGeneralObjectsRoute,
        resolve: {
          content: SandboxRendererShowcaseContentResolver,
        },
      },
      {
        path: 'showcases/general-html',
        component: SandboxRendererShowcaseGeneralHtmlRoute,
        resolve: {
          content: SandboxRendererShowcaseContentResolver,
        },
      },
      {
        path: 'showcases/general-script',
        component: SandboxRendererShowcaseGeneralScriptRoute,
        resolve: {
          content: SandboxRendererShowcaseContentResolver,
        },
      },
      {
        path: 'showcases/general-button',
        component: SandboxRendererShowcaseGeneralButtonRoute,
        resolve: {
          content: SandboxRendererShowcaseContentResolver,
        },
      },
      {
        path: 'showcases/general-line',
        component: SandboxRendererShowcaseGeneralLineRoute,
        resolve: {
          content: SandboxRendererShowcaseContentResolver,
        },
      },
      {
        path: 'showcases/general-carousel',
        component: SandboxRendererShowcaseGeneralCarouselRoute,
        resolve: {
          content: SandboxRendererShowcaseContentResolver,
        },
      },

      {
        path: 'showcases/image',
        component: SandboxRendererShowcaseGeneralImageRoute,
        resolve: {
          content: SandboxRendererShowcaseContentResolver,
        },
      },
      {
        path: 'showcases/video',
        component: SandboxRendererShowcaseGeneralVideoRoute,
        resolve: {
          content: SandboxRendererShowcaseContentResolver,
        },
      },
      {
        path: 'showcases/company-navbar',
        component: SandboxRendererShowcaseCompanyNavbarRoute,
        resolve: {
          content: SandboxRendererShowcaseContentResolver,
        },
      },
      {
        path: 'showcases/shop-category',
        component: SandboxRendererShowcaseShopCategoryRoute,
        resolve: {
          content: SandboxRendererShowcaseContentResolver,
        },
      },
      {
        path: 'showcases/shop-products',
        component: SandboxRendererShowcaseShopProductsRoute,
        resolve: {
          content: SandboxRendererShowcaseContentResolver,
        },
      },
      {
        path: 'showcases/shop-product-details',
        component: SandboxRendererShowcaseShopProductDetailsRoute,
        resolve: {
          content: SandboxRendererShowcaseContentResolver,
        },
      },
      {
        path: 'showcases/shop-cart',
        component: SandboxRendererShowcaseShopCartRoute,
        resolve: {
          content: SandboxRendererShowcaseContentResolver,
        },
      },

      {
        path: 'showcases/:area',
        component: SandboxRendererShowcaseRoute,
      },
      {
        path: 'performance/chess',
        component: SandboxRendererPerfomanceChessRoute,
      },
      {
        path: 'performance/jumper',
        component: SandboxRendererPerformanceJumperRoute,
      },
      {
        path: 'performance/chaotic',
        component: SandboxRendererPerformanceRoute,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    MatIconModule,
    PebRendererModule,
  ],
  providers: [],
  declarations: [
    SandboxRendererRootComponent,
    SandboxRendererSettingsPanelComponent,
    SandboxRendererShowcaseRoute,
    SandboxRendererPerformanceRoute,
    SandboxRendererPreviewComponent,
    SandboxRendererShowcaseShopCategoryRoute,
    SandboxRendererShowcaseGeneralBasicRoute,
    SandboxRendererShowcaseGeneralObjectsRoute,
    SandboxRendererShowcaseCompanyNavbarRoute,
    SandboxRendererShowcaseShopProductsRoute,
    SandboxRendererShowcaseShopProductDetailsRoute,
    SandboxRendererShowcaseGeneralButtonRoute,
    SandboxRendererShowcaseGeneralHtmlRoute,
    SandboxRendererShowcaseGeneralScriptRoute,
    SandboxRendererPerfomanceChessRoute,
    SandboxPerformanceStatsComponent,
    SandboxRendererPerformanceJumperRoute,
    SandboxRendererShowcaseGeneralImageRoute,
    SandboxRendererShowcaseGeneralVideoRoute,
    SandboxRendererShowcaseGeneralLineRoute,
    SandboxRendererShowcaseShopCartRoute,
    SandboxRendererShowcaseGeneralCarouselRoute,
  ],
})
export class SandboxRendererModule {}
