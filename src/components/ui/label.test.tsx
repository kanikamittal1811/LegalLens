import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label component', () => {
  it('renders label with text content and connects to htmlFor', () => {
    render(
      <div>
        <Label htmlFor="email-field">Email Address</Label>
        <input id="email-field" />
      </div>
    );

    const label = screen.getByText('Email Address');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'email-field');
  });
});
