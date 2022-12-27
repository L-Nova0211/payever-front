// Entry file to input different features into global object to allow execute it anywhere on page

import { PeIconsLoader } from './pe-icons-loader';
import { PeSvgIconsLoader } from './pe-svg-icons-loader';

const loader = new PeIconsLoader();
const svgLoader = new PeSvgIconsLoader();

(window as any).PayeverStatic = {
  IconLoader: loader,
  SvgIconsLoader: svgLoader,
};

const icons: string[] = (window as any).pe_static_storage_load_icons;
const hash: string = (window as any).pe_static_storage_hash;
if (icons && icons.length) {
  loader.loadIcons(icons, hash);
}
