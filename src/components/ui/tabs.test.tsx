import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

describe('Tabs component', () => {
  it('renders tabs list and switches tabs content on click', async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Overview</TabsTrigger>
          <TabsTrigger value="tab2">Clauses</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Overview Content</TabsContent>
        <TabsContent value="tab2">Clauses Content</TabsContent>
      </Tabs>
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Clauses')).toBeInTheDocument();
    expect(screen.getByText('Overview Content')).toBeInTheDocument();

    const clausesTab = screen.getByRole('tab', { name: /clauses/i });
    await user.click(clausesTab);

    expect(screen.getByText('Clauses Content')).toBeInTheDocument();
  });
});
