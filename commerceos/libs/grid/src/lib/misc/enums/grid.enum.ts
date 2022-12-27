export enum GridQueryParams {
  ScrollTop = 'scrollTop',
  Page = 'page',
  OpenPreview = 'preview',
  View = 'view',
  SelectedFolder = 'folder'
}

export function getPaginationResult() {
  return window.innerWidth <= 1000
    ? 15
    : (
      window.innerWidth > 1000 && window.innerWidth < 2000
        ? 40
        : 70
    );
}

export enum GridTitleImageStyle {
  Rounded = 'rounded',
  Circle = 'circle',
}

export enum GridSkeletonColumnType {
  Square = 'square',
  Line = 'line',
  Ellipse = 'ellipse',
  Rectangle = 'rectangle',
  Thumbnail = 'thumbnail',
  ThumbnailWithName = 'thumbnail-with-name',
  ThumbnailCircleWithName = 'thumbnail-circle-with-name'
}
