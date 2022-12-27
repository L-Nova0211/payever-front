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
  PebEditorMailNavigationComponent,
  PebEditorMailNavigationModule,
  PebEditorMailToolbarComponent,
  PebEditorMailToolbarModule,
} from '@pe/builder-mail-plugins';
import { PebViewerPreviewDialog } from '@pe/builder-viewer';

import { PebMailEditorState } from './mail-editor.state';

export const pebEditorMailConfig = {
  ui: {
    toolbar: PebEditorMailToolbarComponent,
    navigation: PebEditorMailNavigationComponent,
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
  ],
  state: PebMailEditorState,
};

export const pebEditorToolbarModule = PebEditorMailToolbarModule.withConfig({
  previewDialog: PebViewerPreviewDialog,
});

export const pebEditorMailConfigModules = [
  PebEditorMotionPluginModule,
  PebEditorPagePluginModule,
  PebEditorPageFormatPluginModule,
  PebEditorSectionPluginModule,
  PebEditorShapePluginModule,
  PebEditorTextPluginModule,
  PebEditorGridPluginModule,
  PebEditorMailNavigationModule,
];
