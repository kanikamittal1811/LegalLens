import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';

describe('Card components', () => {
  it('renders card with all nested sub-components', () => {
    render(
      <Card data-testid="card-root">
        <CardHeader>
          <CardTitle>Contract Analysis</CardTitle>
          <CardDescription>Detailed clause breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Important obligations found</p>
        </CardContent>
        <CardFooter>
          <button>Proceed</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card-root')).toBeInTheDocument();
    expect(screen.getByText('Contract Analysis')).toBeInTheDocument();
    expect(screen.getByText('Detailed clause breakdown')).toBeInTheDocument();
    expect(screen.getByText('Important obligations found')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /proceed/i })).toBeInTheDocument();
  });

  it('supports small size variant', () => {
    const { container } = render(<Card size="sm">Small card</Card>);
    const card = container.querySelector('[data-slot="card"]');
    expect(card?.getAttribute('data-size')).toBe('sm');
  });
});
