import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useWebSocket } from './useWebSocket';
import { MockWebSocket } from '../test/mockWebSocket';

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts disconnected with no data', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:4000'));
    expect(result.current.connected).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('marks connected when the socket opens', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:4000'));
    act(() => { MockWebSocket.latest().triggerOpen(); });
    expect(result.current.connected).toBe(true);
  });

  it('parses an incoming DataPoint and exposes it', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:4000'));
    const payload = {
      machineId: 'ASSEMBLY-LINE-1',
      timestamp: '2024-01-01T00:00:00.000Z',
      rpm: 5500,
      temperature: 75,
      status: 'RUNNING',
    };
    act(() => {
      MockWebSocket.latest().triggerOpen();
      MockWebSocket.latest().triggerMessage(JSON.stringify(payload));
    });
    expect(result.current.data).toMatchObject({ rpm: 5500, machineId: 'ASSEMBLY-LINE-1' });
  });

  it('ignores malformed messages without throwing', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:4000'));
    act(() => {
      MockWebSocket.latest().triggerOpen();
      MockWebSocket.latest().triggerMessage('not-valid-json}{');
    });
    expect(result.current.data).toBeNull();
  });

  it('marks disconnected after close', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:4000'));
    act(() => {
      MockWebSocket.latest().triggerOpen();
      MockWebSocket.latest().triggerClose();
    });
    expect(result.current.connected).toBe(false);
  });

  it('reconnects after BASE_DELAY_MS (1 s) following a close', () => {
    renderHook(() => useWebSocket('ws://localhost:4000'));
    expect(MockWebSocket.instances).toHaveLength(1);

    act(() => { MockWebSocket.latest().triggerClose(); });
    act(() => { vi.advanceTimersByTime(1001); });

    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it('closes the socket on unmount and does not reconnect', () => {
    const { unmount } = renderHook(() => useWebSocket('ws://localhost:4000'));
    const ws = MockWebSocket.latest();
    unmount();
    // Even after the retry delay elapses, no new instance is created
    act(() => { vi.advanceTimersByTime(5000); });
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(ws.readyState).toBe(3); // CLOSED
  });
});
