import type { Metrics } from '../src/index';

// Deterministic fake metrics: no fonts needed.
export const fakeMetrics: Metrics = {
  key: (s) => 7.5 * s.length,
  value: (s) => 8.5 * s.length,
  text: (_ptr, s) => ({
    height: (w) => {
      const perLine = Math.max(1, Math.floor(w / 8.5));
      return s.split('\n').reduce((n, p) => n + Math.max(1, Math.ceil(p.length / perLine)), 0) * 28;
    },
  }),
};

