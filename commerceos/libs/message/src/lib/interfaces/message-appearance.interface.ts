export interface PeMessageAppearanceColorBox {
  messagesBottomColor?: string;
  accentColor: string;
  bgChatColor?: string;
  newItem?: boolean;
  _id?: string;
}

export interface PeMessageColorLayout {
  boxColor: PeMessageAppearanceColorBox | null;
  index: number;
}
