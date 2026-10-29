export interface Idea {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  isPinned: boolean;
  isFavorite: boolean;
  collectionId: string | null;
  coverUrl: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ListIdeasParams {
  q?: string | undefined;
  tag?: string | undefined;
  pinned?: boolean | undefined;
  favorite?: boolean | undefined;
  collectionId?: string | undefined;
  sort?: 'updated' | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface CreateIdeaInput {
  title?: string | null | undefined;
  content: string;
  isPinned?: boolean | undefined;
  isFavorite?: boolean | undefined;
  collectionId?: string | null | undefined;
  tags?: string[] | undefined;
}

export interface UpdateIdeaInput {
  title?: string | null | undefined;
  content?: string | undefined;
  isPinned?: boolean | undefined;
  isFavorite?: boolean | undefined;
  collectionId?: string | null | undefined;
  tags?: string[] | undefined;
}

export interface IdeaCollection {
  id: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  ideaCount: number;
}
