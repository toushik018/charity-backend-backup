export const ACTIVITY_TYPES = {
  DONATION: 'DONATION',
  REACTION: 'REACTION',
  FUNDRAISER_CREATED: 'FUNDRAISER_CREATED',
  SHARE: 'SHARE',
} as const;

export const ACTIVITY_MESSAGES = {
  DONATION: 'donated to',
  REACTION: 'reacted to',
  FUNDRAISER_CREATED: 'created a fundraiser',
  SHARE: 'shared',
} as const;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;
