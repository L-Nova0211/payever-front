import { PeAttribute, PeStudioAlbum, PeStudioCategory } from '../core';

export const ALBUMS = 'albums';

export const mapAttributesToAlbums = (
  attributes: PeAttribute[],
  collection: PeStudioAlbum[],
  categoryType: string,
): PeStudioCategory[] => {
  const categories = [];
  let filtered = [];
  const albumHasAttributes = collection.filter(album => album.userAttributes.length > 0);
  const albumNames = attributes.map(attribut => attribut.name);
  const attributesToLoop = attributes.filter(value => albumNames.includes(value.name));
  attributesToLoop.forEach((attribute) => {
    if (albumNames.includes(attribute.name)) {
      filtered.push(attribute);
    }
  });

  filtered.forEach((attribute) => {
    const category = {} as PeStudioCategory;
    (category._id = attribute._id),
      (category.active = false),
      (category.name = attribute.name),
      (category.tree = []),
      (category.listItems = []),
      albumHasAttributes
        .filter(album => album.userAttributes[0].attribute === attribute._id)
        .forEach((item: PeStudioAlbum) => {
          const treeNode = {
            id: item._id,
            key: item._id,
            name: item.name,
            editing: false,
            active: false,
            parentId: item.parent,
            image: item.icon ? item.icon : ``,
            data: item,
            children: listTreeNode(collection, item),
            category: categoryType,
            categoryId: attribute._id,
          };
          category.tree.push(treeNode);
          category.listItems.push(treeNode);
        });
    category.iconUrl = attribute.icon;
    category.editing = false;
    category.active = false;
    categories.push(category);
  });

  return categories;
};
export const listTreeNode = (collection: PeStudioAlbum[], current: PeStudioAlbum) => {
  return collection
    .filter(album => album.parent === current._id)
    .map(item => ({
      id: item._id,
      key: item._id,
      name: item.name,
      parentId: item.parent,
      image: item.icon ? item.icon : ``,
      children:
        item.ancestors.length > 0
          ? collection.filter(album => album.parent === item._id).map(e => listTreeNode(collection, e))
          : [],
      data: item,
      category: 'albums',
    }));
};

export const mapAttributeToCategory = (attribute: PeAttribute, businessId: string): PeStudioCategory => {
  const category = {} as PeStudioCategory;
  category.tree = [];
  category._id = attribute._id;
  category.active = true;
  category.iconUrl = attribute.icon;
  category.editing = true;
  category.listItems = [];
  category.name = attribute.name;
  category.business = businessId;
  category.subCategory = [] as PeStudioCategory[];

  return category;
};

export const mapAlbumToTreeNode = (item: PeStudioAlbum, category: PeStudioCategory, collection: PeStudioAlbum[]) => {
  const treeNode = {
    id: item._id,
    key: item._id,
    name: item.name,
    data: item,
    parentId: item.parent,
    image: item.icon ? item.icon : ``,
    categoryId: category._id,
    children: [],
    category: 'albums',
  };

  return treeNode;
};
