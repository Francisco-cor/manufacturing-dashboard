import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TelemetryDisplay } from './TelemetryDisplay';
import type { DataPoint } from '../types';

const RUNNING: DataPoint = {
  machineId:   'ASSEMBLY-LINE-1',
  timestamp:   '2024-01-01T12:00:00.000Z',
  rpm:         5500.123,
  temperature: 75.456,
  status:      'RUNNING',
};

const ALERT: DataPoint = { ...RUNNING, status: 'ALERT' };

describe('TelemetryDisplay', () => {
  it('shows "Reconnecting" when disconnected with no data', () => {
    render(<TelemetryDisplay data={null} connected={false} />);
    expect(screen.getByText(/Reconnecting/i)).toBeInTheDocument();
  });

  it('shows "Waiting" when connected but no data yet', () => {
    render(<TelemetryDisplay data={null} connected={true} />);
    expect(screen.getByText(/Waiting/i)).toBeInTheDocument();
  });

  it('displays machineId, RPM, and temperature', () => {
    render(<TelemetryDisplay data={RUNNING} connected={true} />);
    expect(screen.getByText(/ASSEMBLY-LINE-1/)).toBeInTheDocument();
    expect(screen.getByText(/5500\.1/)).toBeInTheDocument();
    expect(screen.getByText(/75\.5/)).toBeInTheDocument();
  });

  it('shows RUNNING status', () => {
    render(<TelemetryDisplay data={RUNNING} connected={true} />);
    expect(screen.getByText('RUNNING')).toBeInTheDocument();
  });

  it('shows ALERT status with alert color', () => {
    render(<TelemetryDisplay data={ALERT} connected={true} />);
    const statusEl = screen.getByText('ALERT');
    expect(statusEl).toHaveStyle({ color: '#f87171' });
  });
});
