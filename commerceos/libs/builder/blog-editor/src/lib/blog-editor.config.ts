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

import { PebBlogEditorState } from './blog-editor.state';
import {
  PebEditorBlogMasterPageChangesPlugin,
  PebEditorBlogMasterPageChangesPluginModule,
} from './plugins/master-page-changes/editor';
import { PebEditorBlogMasterPagesPlugin } from './plugins/master-pages/editor';
import { PebEditorBlogSeoPluginModule } from './plugins/seo/editor/seo.module';
import { PebEditorBlogSeoPlugin } from './plugins/seo/editor/seo.plugin';

export const pebEditorBlogConfig = {
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
    PebEditorBlogMasterPagesPlugin,
    PebEditorBlogMasterPageChangesPlugin,
    PebEditorBlogSeoPlugin,
  ],
  state: PebBlogEditorState,
};

export const pebEditorToolbarModule = PebEditorShopToolbarModule.withConfig({
  previewDialog: PebViewerPreviewDialog,
});

export const pebEditorBlogConfigModules = [
  PebEditorMotionPluginModule,
  PebEditorPagePluginModule,
  PebEditorPageFormatPluginModule,
  PebEditorSectionPluginModule,
  PebEditorShapePluginModule,
  PebEditorTextPluginModule,
  PebEditorGridPluginModule,
  PebEditorShopNavigationModule,
  PebEditorBlogMasterPageChangesPluginModule,
  PebEditorBlogSeoPluginModule,
];
