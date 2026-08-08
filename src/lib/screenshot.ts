// Older records may still point at the static placeholder file that used to be
// the death-form default; treat that the same as "no screenshot" so those
// characters get the dynamic name-overlay tombstone too.
const LEGACY_PLACEHOLDER_PATH = '/obituaries/placeholder.svg'

export function hasRealScreenshot(path: string): boolean {
  return Boolean(path) && path !== LEGACY_PLACEHOLDER_PATH
}
