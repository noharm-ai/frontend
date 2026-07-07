/**
 * Module-level flag (deliberately NOT in redux): it cannot survive a page
 * reload, so a refresh mid-training always lands back on real data, and the
 * axios interceptor can check it with zero store coupling.
 */
let active = false;

export const enableTrainingMocks = (): void => {
  active = true;
};

export const disableTrainingMocks = (): void => {
  active = false;
};

export const isTrainingMockActive = (): boolean => active;
