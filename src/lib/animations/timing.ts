export const TIMING = {
  instant: 0,
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  cinematic: 0.8,
} as const;

export const STAGGER = {
  micro: 0.05,
  small: 0.1,
  medium: 0.15,
  large: 0.2,
} as const;

export const DELAY = {
  none: 0,
  short: 0.1,
  medium: 0.2,
  long: 0.4,
} as const;
