import { vi } from 'vitest';

/**
 * Minimal Chart.js stub.
 * Replaces chart.js/auto in all test runs via vitest.config resolve.alias
 * so MetricChart components never touch the canvas API.
 */
export default class Chart {
  data: {
    labels: unknown[];
    datasets: { data: unknown[]; borderDash?: number[] }[];
  } = {
    labels: [],
    datasets: [{ data: [] }, { data: [] }],
  };

  update = vi.fn();
  destroy = vi.fn();
}
