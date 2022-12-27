import {
  HandlerStateEffect,
  PebAppendElementPayload,
  PebContextSchema,
  PebContextSchemaEffect,
  PebContextSchemaId,
  PebEffect,
  PebEffectTarget,
  PebEffectType,
  PebElementDef,
  PebElementId,
  PebPageEffect,
  PebPageId,
  PebRelocateElementPayload,
  PebShopData,
  PebShopEffect,
  PebShopRoute,
  PebStylesheet,
  PebStylesheetEffect,
  PebStylesheetId,
  PebStylesReplacePayload,
  PebTemplate,
  PebTemplateEffect,
  PebTemplateId,
  PebThemePageInterface,
  PebThemeShortPageInterface,
} from '@pe/builder-core';

export function pebCreateEffect(
  type: PebShopEffect.Init,
  target: null,
  payload: PebThemePageInterface,
): PebEffect<PebShopEffect.Init>;
export function pebCreateEffect(
  type: PebShopEffect.UpdateData,
  target: null,
  payload: Partial<PebShopData>,
): PebEffect<PebShopEffect.UpdateData>;
export function pebCreateEffect(
  type: PebShopEffect.UpdateRouting,
  target: null,
  payload: PebShopRoute[],
): PebEffect<PebShopEffect.UpdateRouting>;
export function pebCreateEffect(
  type: PebShopEffect.PatchRouting,
  target: null,
  payload: PebShopRoute[],
): PebEffect<PebShopEffect.PatchRouting>;
export function pebCreateEffect(
  type: PebShopEffect.UpdatePages,
  target: null,
  payload: PebThemeShortPageInterface[],
): PebEffect<PebShopEffect.UpdatePages>;
export function pebCreateEffect(
  type: PebShopEffect.AppendPage,
  target: null,
  payload: PebThemeShortPageInterface,
): PebEffect<PebShopEffect.AppendPage>;
export function pebCreateEffect(
  type: HandlerStateEffect.ReorderPages,
  target: null,
  payload: string[],
): PebEffect<HandlerStateEffect.ReorderPages>;
export function pebCreateEffect(
  type: HandlerStateEffect.DeletePage,
  target: PebPageId,
  payload: PebPageId,
): PebEffect<HandlerStateEffect.DeletePage>;
export function pebCreateEffect(
  type: PebPageEffect.Create,
  target: PebPageId,
  payload: PebThemePageInterface,
): PebEffect<PebPageEffect.Create>;
export function pebCreateEffect(
  type: PebPageEffect.Update,
  target: PebPageId,
  payload: Partial<PebThemePageInterface>,
): PebEffect<PebPageEffect.Update>;

export function pebCreateEffect(
  type: PebTemplateEffect.Init,
  target: PebTemplateId,
  payload: PebTemplate,
): PebEffect<PebTemplateEffect.Init>;
export function pebCreateEffect(
  type: PebTemplateEffect.Destroy,
  target: PebTemplateId,
  payload: PebTemplateId,
): PebEffect<PebTemplateEffect.Destroy>;
export function pebCreateEffect(
  type: PebTemplateEffect.AppendElement,
  target: PebTemplateId,
  payload: PebAppendElementPayload,
): PebEffect<PebTemplateEffect.AppendElement>;
export function pebCreateEffect(
  type: PebTemplateEffect.UpdateElement,
  target: PebTemplateId,
  payload: PebElementDef,
): PebEffect<PebTemplateEffect.UpdateElement>;
export function pebCreateEffect(
  type: PebTemplateEffect.RelocateElement,
  target: PebTemplateId,
  payload: PebRelocateElementPayload,
): PebEffect<PebTemplateEffect.RelocateElement>;
export function pebCreateEffect(
  type: PebTemplateEffect.DeleteElement,
  target: PebTemplateId,
  payload: PebElementId,
): PebEffect<PebTemplateEffect.DeleteElement>;

export function pebCreateEffect(
  type: PebStylesheetEffect.Init,
  target: PebStylesheetId,
  payload: PebStylesheet,
): PebEffect<PebStylesheetEffect.Init>;
export function pebCreateEffect(
  type: PebStylesheetEffect.Destroy,
  target: PebStylesheetId,
  payload: null,
): PebEffect<PebStylesheetEffect.Destroy>;
export function pebCreateEffect(
  type: PebStylesheetEffect.Update,
  target: PebStylesheetId,
  payload: PebStylesheet,
): PebEffect<PebStylesheetEffect.Update>;
export function pebCreateEffect(
  type: PebStylesheetEffect.Replace,
  target: PebStylesheetId,
  payload: PebStylesReplacePayload,
): PebEffect<PebStylesheetEffect.Replace>;
export function pebCreateEffect(
  type: PebStylesheetEffect.Delete,
  target: PebStylesheetId,
  payload: PebStylesheetId,
): PebEffect<PebStylesheetEffect.Delete>;

export function pebCreateEffect(
  type: PebContextSchemaEffect.Init,
  target: PebContextSchemaId,
  payload: PebContextSchema,
): PebEffect<PebContextSchemaEffect.Init>;
export function pebCreateEffect(
  type: PebContextSchemaEffect.Destroy,
  target: PebContextSchemaId,
  payload: null,
): PebEffect<PebContextSchemaEffect.Destroy>;
export function pebCreateEffect(
  type: PebContextSchemaEffect.Update,
  payload: PebContextSchema,
  target: PebContextSchemaId,
): PebEffect<PebContextSchemaEffect.Update>;
export function pebCreateEffect(
  type: PebContextSchemaEffect.Delete,
  target: PebContextSchemaId,
  payload: PebContextSchemaId,
): PebEffect<PebContextSchemaEffect.Delete>;

export function pebCreateEffect(
  type: PebEffectType,
  target: any,
  payload: any,
) {
  const targetType = getTargetType(type);

  return {
    type,
    payload,
    target: `${targetType}${target ? `:${target}` : ``}`,
  };

}

function getTargetType(type: PebEffectType): PebEffectTarget {
  return Object.values(PebShopEffect).includes(type as PebShopEffect)
    ? PebEffectTarget.Shop
    : Object.values(PebPageEffect).includes(type as PebPageEffect)
      ? PebEffectTarget.Pages
      : Object.values(PebTemplateEffect).includes(type as PebTemplateEffect)
        ? PebEffectTarget.Templates
        : Object.values(PebStylesheetEffect).includes(type as PebStylesheetEffect)
          ? PebEffectTarget.Stylesheets
          : Object.values(PebContextSchemaEffect).includes(type as PebContextSchemaEffect)
            ? PebEffectTarget.ContextSchemas
            : null;
}
