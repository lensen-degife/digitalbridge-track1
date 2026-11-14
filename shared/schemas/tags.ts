export const SUPPORT_TAGS = [
  'screen_reader_ready',
  'step_free_access',
  'flexible_hours',
  'sign_language_support',
  'low_literacy_friendly',
  'remote_option',
] as const;

export type SupportTag = (typeof SUPPORT_TAGS)[number];
