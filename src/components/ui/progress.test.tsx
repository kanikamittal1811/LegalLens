import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress, ProgressLabel, ProgressValue } from './progress';

describe('Progress component', () => {
  it('renders progress bar with label and value', () => {
    render(
      <Progress value={75}>
        <ProgressLabel>Analysis Progress</ProgressLabel>
        <ProgressValue>75%</ProgressValue>
      </Progress>
    );

    expect(screen.getByText('Analysis Progress')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});
