export interface Idea {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ListIdeasParams {
  q?: string | undefined;
  tag?: string | undefined;
  pinned?: boolean | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface CreateIdeaInput {
  title?: string | null | undefined;
  content: string;
  isPinned?: boolean | undefined;
  tags?: string[] | undefined;
}

export interface UpdateIdeaInput {
  title?: string | null | undefined;
  content?: string | undefined;
  isPinned?: boolean | undefined;
  tags?: string[] | undefined;
}
