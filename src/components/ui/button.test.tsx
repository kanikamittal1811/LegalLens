import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button component', () => {
  it('renders button with children text', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('handles click events when enabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Action</Button>);

    const button = screen.getByRole('button', { name: /action/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire click events when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled Action</Button>);

    const button = screen.getByRole('button', { name: /disabled action/i });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies variant and custom class names properly', () => {
    const { container } = render(
      <Button variant="destructive" size="lg" className="custom-extra-class">
        Delete
      </Button>
    );

    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-destructive');
    expect(button?.className).toContain('custom-extra-class');
  });

  it('supports outline variant', () => {
    const { container } = render(
      <Button variant="outline">Outline</Button>
    );
    const button = container.querySelector('button');
    expect(button?.className).toContain('border-border');
  });
});
