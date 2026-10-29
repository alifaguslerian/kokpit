import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { IdeaCollection } from '../types';

export function useIdeaCollections() {
  return useQuery({
    queryKey: ['idea-collections'],
    queryFn: async () => {
      const collections: IdeaCollection[] = [];
      let offset = 0;
      for (;;) {
        const page = await apiClient.get<{ data: IdeaCollection[]; nextOffset: number | null }>(
          '/api/idea-collections',
          { params: { limit: 100, offset } },
        );
        collections.push(...page.data);
        if (page.nextOffset == null) return collections;
        if (page.nextOffset <= offset) throw new Error('Invalid collection pagination.');
        offset = page.nextOffset;
      }
    },
  });
}

type CollectionChange =
  | { type: 'create'; name: string }
  | { type: 'rename'; id: string; name: string }
  | { type: 'delete'; id: string }
  | { type: 'reorder'; ids: string[] };

export function useChangeCollection() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (change: CollectionChange) => {
      if (change.type === 'create')
        await apiClient.post('/api/idea-collections', { name: change.name });
      if (change.type === 'rename')
        await apiClient.patch(`/api/idea-collections/${change.id}`, { name: change.name });
      if (change.type === 'delete') await apiClient.delete(`/api/idea-collections/${change.id}`);
      if (change.type === 'reorder')
        await apiClient.put('/api/idea-collections/reorder', { ids: change.ids });
    },
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['idea-collections'] }),
        client.invalidateQueries({ queryKey: ['ideas'] }),
      ]);
    },
  });
}
