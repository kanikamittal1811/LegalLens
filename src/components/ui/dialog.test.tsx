import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './dialog';
import { Button } from './button';

describe('Dialog component', () => {
  it('opens modal on trigger click and displays title/description', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger render={<Button>Open Details</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clause Details</DialogTitle>
            <DialogDescription>Full text analysis</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    const openBtn = screen.getByRole('button', { name: /open details/i });
    expect(openBtn).toBeInTheDocument();

    await user.click(openBtn);

    expect(await screen.findByText('Clause Details')).toBeInTheDocument();
    expect(screen.getByText('Full text analysis')).toBeInTheDocument();
  });
});
