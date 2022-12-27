import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

import { PebAnimation } from '@pe/builder-core';
import { AlignType, SelectOption } from '@pe/builder-old';

import { VideoSubTab } from '../editor-element';

export interface PebAlignment {
  align: AlignType;
}

export interface PebBackground {
  bgColor: string;
  bgColorGradientAngle: number;
  bgColorGradientStart: string;
  bgColorGradientStop: string;
  file: File;
  bgImage: string;
  fillType: SelectOption;
  imageSize: SelectOption;
  imageScale: number;
}

export interface PebVideo {
  videoSubTab: VideoSubTab;
  sourceOptions: SelectOption[];
  sourceType: SelectOption;
  source: string;
  preview: string;
  file: string;
  autoplay: boolean;
  controls: boolean;
  loop: boolean;
  sound: boolean;
}

export interface PebShadow {
  hasShadow: boolean;
  shadowBlur: number;
  shadowColor: string;
  shadowOffset: number;
  shadowOpacity: number;
  shadowAngle: number;
}

export interface PebDescription {
  description: string;
}

export interface PebEditorElementPropertyAlignment extends PebEditorElementProperty<PebAlignment> {
  submit: Subject<void>;
}

export interface PebEditorElementProperty<T> {
  initialValue?: T;
  form: FormGroup;
  update: () => void;
  submit: Subject<any>;
  result$?: Subject<any>;
}

export interface PebEditorElementPropertyBackground extends PebEditorElementProperty<PebBackground> {
  submit: Subject<void>;
}

export interface PebEditorElementPropertyFilter extends PebEditorElementProperty<{
  brightness: number;
  saturate: number;
}> {
}

export interface PebEditorElementPropertyShadow extends PebEditorElementProperty<PebShadow> {
  submit: Subject<void>;
}

export interface PebEditorElementPropertyVideo extends PebEditorElementProperty<PebVideo> {
}

export interface PebEditorElementPropertyDescription extends PebEditorElementProperty<PebDescription> {
}

export interface PebEditorElementPropertyRadius extends PebEditorElementProperty<{ borderRadius: string | number }> {
  submit: Subject<void>;
}

export interface PebEditorElementPropertyBuildIn extends PebEditorElementProperty<PebAnimation> {}

export interface PebEditorElementPropertyAction extends PebEditorElementProperty<PebAnimation> {}

export interface PebEditorElementPropertyBuildOut extends PebEditorElementProperty<PebAnimation> {}
