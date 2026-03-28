import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import App from './App';
import { MockWebSocket } from './test/mockWebSocket';

describe('App', () => {
  beforeEach(() => {
    // Freeze timers so useAlarms' setInterval never fires during these tests,
    // and stub fetch to a pending promise so no async state updates escape act().
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the dashboard title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Manufacturing Dashboard/i })).toBeInTheDocument();
  });

  it('shows "Reconnecting" before the WebSocket opens (initial disconnected state)', () => {
    render(<App />);
    // connected starts as false → TelemetryDisplay renders the reconnecting message
    expect(screen.getByText(/Reconnecting to server/i)).toBeInTheDocument();
  });

  it('shows "Waiting for telemetry" once the socket opens but no data has arrived', () => {
    render(<App />);
    act(() => { MockWebSocket.latest().triggerOpen(); });
    expect(screen.getByText(/Waiting for telemetry data/i)).toBeInTheDocument();
  });

  it('renders the Recent Alarms section', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Recent Alarms/i })).toBeInTheDocument();
  });

  it('displays telemetry when a WS message arrives', () => {
    render(<App />);
    const payload = {
      machineId:   'ASSEMBLY-LINE-1',
      timestamp:   '2024-06-01T10:00:00.000Z',
      rpm:         5800,
      temperature: 80,
      status:      'RUNNING',
    };
    act(() => {
      MockWebSocket.latest().triggerOpen();
      MockWebSocket.latest().triggerMessage(JSON.stringify(payload));
    });
    expect(screen.getByText(/ASSEMBLY-LINE-1/)).toBeInTheDocument();
    expect(screen.getByText('RUNNING')).toBeInTheDocument();
  });

  it('shows the alert banner when an ALERT message arrives', () => {
    render(<App />);
    const payload = {
      machineId:   'ASSEMBLY-LINE-1',
      timestamp:   '2024-06-01T10:00:00.000Z',
      rpm:         6500,
      temperature: 80,
      status:      'ALERT',
      alert:       { type: 'HighRPM', level: 'CRITICAL' },
    };
    act(() => {
      MockWebSocket.latest().triggerOpen();
      MockWebSocket.latest().triggerMessage(JSON.stringify(payload));
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/HighRPM/)).toBeInTheDocument();
  });
});
