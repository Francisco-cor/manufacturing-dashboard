import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AlertBanner } from './AlertBanner';

describe('AlertBanner', () => {
  it('renders nothing when alert is null', () => {
    const { container } = render(<AlertBanner alert={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the alert type and level', () => {
    render(<AlertBanner alert={{ type: 'HighRPM', level: 'CRITICAL' }} />);
    expect(screen.getByText(/HighRPM/)).toBeInTheDocument();
    expect(screen.getByText(/CRITICAL/)).toBeInTheDocument();
  });

  it('has role="alert" for screen readers', () => {
    render(<AlertBanner alert={{ type: 'Overheat', level: 'CRITICAL' }} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('has aria-live="assertive"', () => {
    render(<AlertBanner alert={{ type: 'Overheat', level: 'CRITICAL' }} />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });
});
