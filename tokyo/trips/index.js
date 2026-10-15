import tokyo from './tokyo-2026/profile.js';
import template from './template/profile.js';

// Add new distributed profiles here. The old /tokyo/ URL always opens Tokyo.
export const defaultTripId = 'tokyo-2026';
export const builtInProfiles = [tokyo, template];
