import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AlarmTable } from './AlarmTable';
import type { Alarm } from '../types';

const ALARMS: Alarm[] = [
  {
    machineId:   'ASSEMBLY-LINE-1',
    timestamp:   '2024-01-01T12:34:56.000Z',
    rpm:         6500.5,
    temperature: 85.3,
    alert:       { type: 'HighRPM', level: 'CRITICAL' },
  },
  {
    machineId:   'ASSEMBLY-LINE-1',
    timestamp:   '2024-01-01T12:35:00.000Z',
    rpm:         5200.0,
    temperature: 91.1,
    alert:       { type: 'Overheat', level: 'WARNING' },
  },
];

describe('AlarmTable', () => {
  it('shows empty-state message when there are no alarms', () => {
    render(<AlarmTable alarms={[]} />);
    expect(screen.getByText(/No alerts registered/i)).toBeInTheDocument();
  });

  it('renders one row per alarm', () => {
    render(<AlarmTable alarms={ALARMS} />);
    expect(screen.getByText('HighRPM')).toBeInTheDocument();
    expect(screen.getByText('Overheat')).toBeInTheDocument();
  });

  it('shows hh:mm:ss extracted from the timestamp', () => {
    render(<AlarmTable alarms={[ALARMS[0]]} />);
    expect(screen.getByText('12:34:56')).toBeInTheDocument();
  });

  it('renders CRITICAL alarms in red', () => {
    render(<AlarmTable alarms={[ALARMS[0]]} />);
    expect(screen.getByText('CRITICAL')).toHaveStyle({ color: '#f87171' });
  });

  it('renders non-CRITICAL alarms in yellow', () => {
    render(<AlarmTable alarms={[ALARMS[1]]} />);
    expect(screen.getByText('WARNING')).toHaveStyle({ color: '#facc15' });
  });

  it('renders column headers with scope="col"', () => {
    render(<AlarmTable alarms={ALARMS} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
    headers.forEach(h => expect(h).toHaveAttribute('scope', 'col'));
  });
});
