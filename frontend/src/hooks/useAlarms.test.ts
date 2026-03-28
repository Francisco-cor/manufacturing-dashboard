import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAlarms } from './useAlarms';
import type { Alarm } from '../types';

const ALARM: Alarm = {
  machineId:   'ASSEMBLY-LINE-1',
  timestamp:   '2024-01-01T12:00:00.000Z',
  rpm:         6500,
  temperature: 85,
  alert:       { type: 'HighRPM', level: 'CRITICAL' },
};

describe('useAlarms', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts with an empty list', () => {
    const { result } = renderHook(() => useAlarms('http://localhost:4000/api/alarms'));
    expect(result.current.alarms).toHaveLength(0);
  });

  it('fetches on mount and populates the list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [ALARM],
    }));
    const { result } = renderHook(() => useAlarms('http://localhost:4000/api/alarms'));
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(result.current.alarms).toHaveLength(1);
    expect(result.current.alarms[0].machineId).toBe('ASSEMBLY-LINE-1');
  });

  it('returns results in reverse-chronological order (last first)', async () => {
    const alarms = [
      { ...ALARM, timestamp: '2024-01-01T00:00:00.000Z' },
      { ...ALARM, timestamp: '2024-01-01T00:01:00.000Z' },
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => alarms,
    }));
    const { result } = renderHook(() => useAlarms('http://localhost:4000/api/alarms'));
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(result.current.alarms[0].timestamp).toBe('2024-01-01T00:01:00.000Z');
  });

  it('handles network errors gracefully (stays empty)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const { result } = renderHook(() => useAlarms('http://localhost:4000/api/alarms'));
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(result.current.alarms).toHaveLength(0);
  });

  it('polls on the specified interval', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);
    renderHook(() => useAlarms('http://localhost:4000/api/alarms', 1000));
    // Initial call on mount
    await act(async () => { await vi.runAllTimersAsync(); });
    const callsAfterMount = fetchMock.mock.calls.length;
    // Advance two more intervals
    await act(async () => {
      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();
    });
    expect(fetchMock.mock.calls.length).toBeGreaterThan(callsAfterMount);
  });
});
