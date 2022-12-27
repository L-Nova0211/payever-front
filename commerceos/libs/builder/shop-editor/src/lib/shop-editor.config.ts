import {
  PebEditorElementManipulationPlugin,
  PebEditorGridPlugin,
  PebEditorGridPluginModule,
  PebEditorMotionPlugin,
  PebEditorMotionPluginModule,
  PebEditorPageFormatPlugin,
  PebEditorPageFormatPluginModule,
  PebEditorPagePlugin,
  PebEditorPagePluginModule,
  PebEditorSectionPlugin,
  PebEditorSectionPluginModule,
  PebEditorShapePlugin,
  PebEditorShapePluginModule,
  PebEditorTextPlugin,
  PebEditorTextPluginModule,
} from '@pe/builder-base-plugins';
import {
  PebEditorShopNavigationComponent,
  PebEditorShopNavigationModule,
  PebEditorShopToolbarComponent,
  PebEditorShopToolbarModule,
} from '@pe/builder-shop-plugins';
import { PebViewerPreviewDialog } from '@pe/builder-viewer';

import {
  PebEditorShopMasterPageChangesPlugin,
  PebEditorShopMasterPageChangesPluginModule,
} from './plugins/master-page-changes/editor';
import { PebEditorShopMasterPagesPlugin } from './plugins/master-pages/editor';
import { PebEditorShopSeoPluginModule } from './plugins/seo/editor/seo.module';
import { PebEditorShopSeoPlugin } from './plugins/seo/editor/seo.plugin';
import { PebShopEditorState } from './shop-editor.state';

export const pebEditorShopConfig = {
  ui: {
    toolbar: PebEditorShopToolbarComponent,
    navigation: PebEditorShopNavigationComponent,
  },
  plugins: [
    PebEditorElementManipulationPlugin,
    PebEditorMotionPlugin,
    PebEditorPagePlugin,
    PebEditorPageFormatPlugin,
    PebEditorSectionPlugin,
    PebEditorShapePlugin,
    PebEditorTextPlugin,
    PebEditorGridPlugin,
    PebEditorShopMasterPagesPlugin,
    PebEditorShopMasterPageChangesPlugin,
    PebEditorShopSeoPlugin,
  ],
  state: PebShopEditorState,
};

export const pebEditorToolbarModule = PebEditorShopToolbarModule.withConfig({
  previewDialog: PebViewerPreviewDialog,
});

export const pebEditorShopConfigModules = [
  PebEditorMotionPluginModule,
  PebEditorPagePluginModule,
  PebEditorPageFormatPluginModule,
  PebEditorSectionPluginModule,
  PebEditorShapePluginModule,
  PebEditorTextPluginModule,
  PebEditorGridPluginModule,
  PebEditorShopNavigationModule,
  PebEditorShopMasterPageChangesPluginModule,
  PebEditorShopSeoPluginModule,
];
