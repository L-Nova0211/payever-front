/**
 *  Motion
 */

export interface PebAnimation {
  type: PebAnimationType;
  delay: number;
  duration: number;
  order: number;
  event: PebMotionEvent;
  eventType?: PebMotionEventType;
  delivery: PebMotionDelivery;
  textDelivery?: PebMotionTextDelivery;
  direction?: PebMotionDirection;
  bounce?: boolean;
  in?: PebAnimationType;
  out?: PebAnimationType;
}

export type PebAnimationType = PebBuildInAnimationType | PebActionAnimationType | PebBuildOutAnimationType;

export enum PebMotionType {
  BuildIn = 'build-in',
  Action = 'action',
  BuildOut = 'build-out',
}

export enum PebMotionEvent {
  None = 'none',
  OnLoad = 'on-load',
  OnClick = 'on-click',
  OnDataPoint = 'on-data-point',
  // Scrolling = 'scrolling',
  After = 'after',
}

export enum PebMotionEventType {
  BasketFill = 'basket-fill',
  Snackbar = 'snackbar',
}

export enum PebMotionTextDelivery {
  Object = 'by-object',
  Word = 'by-word',
  Character = 'by-character',
}

export enum PebMotionDelivery {
  AtOnce = 'at-once',
  Paragraph = 'by-paragraph',
  ParagraphGroup = 'by-paragraph-group',
  HighlightedParagraph = 'by-highlighted-paragraph',
}

export enum PebMotionDirection {
  LeftToRight = 'left-to-right',
  RightToLeft = 'right-to-left',
  TopToBottom = 'top-to-bottom',
  BottomToTop = 'bottom-to-top',
}

export interface PebMotion {
  buildIn: PebAnimation;
  action: PebAnimation;
  buildOut: PebAnimation;
}

export enum PebBuildInAnimationType {
  Dissolve = 'dissolve-in',
  Blur = 'blur-in',
  Drift = 'drift-in',
  // Typewriter = 'typewriter-in',
  MoveIn = 'move-in',
  Pop = 'pop-in',
  Scale = 'scale-in',
  // Spin = 'Spin',
  None = 'none',
}

export enum PebActionAnimationType {
  Move = 'move',
  Blur = 'blur',
  Dissolve = 'dissolve',
  None = 'none',
}

export enum PebBuildOutAnimationType {
  Dissolve = 'dissolve-out',
  MoveOut = 'move-out',
  Disappear = 'disappear',
  // Typewriter = 'Typewriter out',
  Blur = 'blur-out',
  None = 'none',
}
