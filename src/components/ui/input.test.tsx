import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input component', () => {
  it('renders input with placeholder and handles user typing', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Search clauses..." />);

    const input = screen.getByPlaceholderText('Search clauses...');
    expect(input).toBeInTheDocument();

    await user.type(input, 'termination');
    expect(input).toHaveValue('termination');
  });

  it('can be disabled and prevents interaction', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
  });
});
