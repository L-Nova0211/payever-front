import { PebScreen } from '../constants';

import { PebMigration } from './migrations.interface';

export const removeGroupElements: PebMigration = (page, element) => {
  const groups = element.children.filter(elm => elm?.type as string === 'group');

  groups.forEach((group) => {
    const children = element.children.filter(elm => elm.id !== group.id);
    const groupChildren = group.children.map(elm => ({
      ...elm,
      parent: element.parent,
      data: { ...elm.data, groupId: [group.id] },
      // data: { ...elm.data, groupId: elm.data.groupId ? [...elm.data.groupId, group.id] : [group.id] },
    }));
    element.children = children.concat(groupChildren);

    Object.values(PebScreen).forEach(screen => {
      const groupStyle = page.stylesheets[screen][group.id];
      if (groupStyle) {
        groupChildren.forEach(elm => {
          const { left, top } = page.stylesheets[screen][elm.id] ?? { left: 0, top: 0 };
          page.stylesheets[screen][elm.id].left = left + groupStyle.left;
          page.stylesheets[screen][elm.id].top = top + groupStyle.top;

          delete page.stylesheets[screen][group.id];
        });
      }
    });
  });

  return element;
}
