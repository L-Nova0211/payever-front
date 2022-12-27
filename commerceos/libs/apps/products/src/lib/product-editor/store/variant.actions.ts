
import { VariantsSection } from '../../shared/interfaces/section.interface';

export enum VariantActionTypes {
  LoadVariant = '[Variant] Load Variant',
  VariantLoaded = '[Variant] Variant Loaded',
  UpdateVariant = '[Variant] Update Variant',
  CleanVariant = '[Variant] Clean Variant',
}



export class loadVariant {
  static type =  VariantActionTypes.LoadVariant;
  constructor(public variantId: string, public isCreated: boolean) { }
}

export class variantLoaded {
  static type =  VariantActionTypes.VariantLoaded;
  constructor(public variant: VariantsSection) { }
}

export class updateVariant {
  static type =  VariantActionTypes.UpdateVariant;
  constructor(public variant: Partial<VariantsSection>) { }
}

export class cleanVariant {
  static type = VariantActionTypes.CleanVariant;
}


