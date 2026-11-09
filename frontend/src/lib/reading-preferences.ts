import type { ReadingPreferences } from '@integra/shared/auth';
import type { AuthUser } from '../api/auth.api';

export const DEFAULT_READING_PREFERENCES: ReadingPreferences = { textSize: 'default', highContrast: false };

/** An API from before reading preferences existed may still answer during a deploy. */
export function readingPreferencesOf(user: AuthUser): ReadingPreferences {
  return user.readingPreferences ?? DEFAULT_READING_PREFERENCES;
}
