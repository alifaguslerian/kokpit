export interface QuickLink {
  id: string;
  userId: string;
  name: string;
  url: string;
  iconType: string;
  iconValue: string | null;
  groupName: string | null;
  position: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListQuickLinksParams {
  group?: string | undefined;
  favorite?: boolean | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface CreateQuickLinkInput {
  name: string;
  url: string;
  iconType?: string | undefined;
  iconValue?: string | null | undefined;
  groupName?: string | null | undefined;
  position?: number | undefined;
  isFavorite?: boolean | undefined;
}

export interface UpdateQuickLinkInput {
  name?: string | undefined;
  url?: string | undefined;
  iconType?: string | undefined;
  iconValue?: string | null | undefined;
  groupName?: string | null | undefined;
  position?: number | undefined;
  isFavorite?: boolean | undefined;
}
