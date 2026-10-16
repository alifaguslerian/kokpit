import type { Database } from './client';
import { users, userSettings } from './schema';

export const DEFAULT_OWNER_ID = '00000000-0000-0000-0000-000000000001';

export interface SeedOptions {
  ownerId?: string;
  ownerEmail?: string;
  displayName?: string;
  timezone?: string;
  locale?: string;
}

export async function seedOwner(db: Database, options: SeedOptions = {}) {
  const ownerId = options.ownerId ?? DEFAULT_OWNER_ID;
  const email = options.ownerEmail ?? 'owner@example.com';
  const displayName = options.displayName ?? 'Owner';
  const now = new Date().toISOString();

  await db
    .insert(users)
    .values({
      id: ownerId,
      email,
      displayName,
      role: 'owner',
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing();

  await db
    .insert(userSettings)
    .values({
      userId: ownerId,
      timezone: options.timezone ?? 'Asia/Jakarta',
      locale: options.locale ?? 'id-ID',
      clockFormat: '24h',
      quoteRotationMinutes: 60,
      musicVolume: 0.7,
      sidebarCollapsed: 0,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing();

  return { ownerId, email };
}
