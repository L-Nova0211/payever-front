import { sumBy } from 'lodash-es';

import { PE_CHANNELS_GROUPS, PeChannelGroup } from '../interfaces/channel-group.interface';
import { ChannelSetInterface } from '../interfaces/channel-set.interface';
import { Product } from '../interfaces/product.interface';
import { InventoryInterface } from '../interfaces/section.interface';

export function getProductCategory(product: Product): string {
  const categories: string[] = (product.categories || [])
    .map(category => category && category.title)
    .filter(title => title);

  if (categories && categories.length) {
    return categories[0];
  }

  return null;
}

export function getTrackableProductInventory(
  product: Product,
  inventories: InventoryInterface[]
): InventoryInterface[] {
  const skus: string[] = product.variants && product.variants.length
    ? product.variants.map(variant => variant.sku)
    : [product.sku];

  const trackableProductInventory: InventoryInterface[] = [];
  inventories = inventories || [];
  inventories.forEach((inventory) => {
    const isProductInventory: boolean = inventory && skus.includes(inventory.sku);
    if (isProductInventory && inventory.isTrackable) {
      trackableProductInventory.push(inventory);
    }
  });

  return trackableProductInventory;
}

export function isProductInventoryTrackable(product: Product, inventories: InventoryInterface[]): boolean {
  const trackableProductInventory: InventoryInterface[] = getTrackableProductInventory(product, inventories);

  return trackableProductInventory.length > 0;
}

export function getProductInventoryAmount(product: Product, inventories: InventoryInterface[]): number {
  const trackableProductInventory: InventoryInterface[] = getTrackableProductInventory(product, inventories);

  return sumBy(trackableProductInventory, inventory => inventory.stock || 0);
}

export function getProductVariants(product: Product): number {
  return (product.variants || []).length;
}

export function getProductChannelsGroups(product: Product): PeChannelGroup[] {
  const productChannelSets: ChannelSetInterface[] = product.channelSets || [];

  return PE_CHANNELS_GROUPS.reduce((acc: PeChannelGroup[], channelGroup) => {
    if (productChannelSets.some(channelSet => channelSet.type === channelGroup.type )) {
      acc.push(channelGroup);
    }

    return acc;
  }, []);
}
