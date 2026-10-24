export const queryKeys = {
  system: {
    all: ['system'] as const,
    health: () => [...queryKeys.system.all, 'health'] as const,
  },
  user: {
    all: ['user'] as const,
    settings: () => [...queryKeys.user.all, 'settings'] as const,
  },
  ideas: {
    all: ['ideas'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.ideas.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.ideas.all, 'detail', id] as const,
  },
  library: {
    all: ['library'] as const,
    links: () => [...queryKeys.library.all, 'links'] as const,
  },
  college: {
    all: ['college'] as const,
    semesters: () => [...queryKeys.college.all, 'semesters'] as const,
    semester: (id: string) => [...queryKeys.college.all, 'semester', id] as const,
    course: (id: string) => [...queryKeys.college.all, 'course', id] as const,
    week: (id: string) => [...queryKeys.college.all, 'week', id] as const,
    courses: (semesterId: string) => [...queryKeys.college.all, 'courses', semesterId] as const,
    weeks: (courseId: string) => [...queryKeys.college.all, 'weeks', courseId] as const,
    materials: (weekId: string) => [...queryKeys.college.all, 'materials', weekId] as const,
  },
  music: {
    all: ['music'] as const,
    tracks: () => [...queryKeys.music.all, 'tracks'] as const,
    playlists: () => [...queryKeys.music.all, 'playlists'] as const,
  },
  news: {
    all: ['news'] as const,
    feed: (filters?: Record<string, unknown>) => [...queryKeys.news.all, 'feed', filters] as const,
  },
  quotes: {
    all: ['quotes'] as const,
    current: () => [...queryKeys.quotes.all, 'current'] as const,
  },
} as const;
