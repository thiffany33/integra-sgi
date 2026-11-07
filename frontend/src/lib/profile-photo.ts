import { useSyncExternalStore } from 'react';
import { profileApi } from '../api/profile.api';

// One signed photo URL shared by the account menu and the profile page, so an upload shows everywhere.
type PhotoState = { userId: string | null; url: string | null; loaded: boolean };

let state: PhotoState = { userId: null, url: null, loaded: false };
let inFlight: { userId: string; request: Promise<string | null> } | null = null;
// Bumped by uploads and removals so a slower, older load cannot overwrite them.
let version = 0;
const listeners = new Set<() => void>();

function update(next: PhotoState) {
  state = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useProfilePhoto(): string | null {
  return useSyncExternalStore(subscribe, () => state.url);
}

/**
 * Loads the photo for the signed-in user. Concurrent callers share one request; `fresh` skips the
 * cached URL, because signed URLs expire after a few minutes.
 */
export function loadProfilePhoto(userId: string, { fresh = false } = {}): Promise<string | null> {
  if (inFlight?.userId === userId) return inFlight.request;
  if (!fresh && state.userId === userId && state.loaded) return Promise.resolve(state.url);
  if (state.userId !== userId) update({ userId, url: null, loaded: false });
  const started = version;
  const current = () => state.userId === userId && version === started;
  const request = profileApi.getPhoto().then(
    url => { if (current()) update({ userId, url, loaded: true }); return url; },
    (error: unknown) => { if (current()) update({ userId, url: null, loaded: true }); throw error; },
  ).finally(() => { if (inFlight?.request === request) inFlight = null; });
  inFlight = { userId, request };
  return request;
}

export function setProfilePhoto(userId: string, url: string | null): void {
  version += 1;
  update({ userId, url, loaded: true });
}

export function clearProfilePhoto(): void {
  inFlight = null;
  version += 1;
  update({ userId: null, url: null, loaded: false });
}
