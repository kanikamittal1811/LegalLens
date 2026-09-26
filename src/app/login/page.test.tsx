import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock firebase
const mockSignInWithPopup = vi.fn();
vi.mock('firebase/auth', () => ({
  signInWithPopup: (...args: unknown[]) => mockSignInWithPopup(...args),
  GoogleAuthProvider: vi.fn(),
}));

vi.mock('@/lib/firebase/client', () => ({
  auth: {},
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login page branding and Google sign-in button', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: /welcome to legallens/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByText(/back to home/i)).toBeInTheDocument();
  });

  it('signs in with Google and redirects to dashboard upon success', async () => {
    const user = userEvent.setup();
    mockSignInWithPopup.mockResolvedValueOnce({
      user: { uid: 'user-123', email: 'test@example.com' },
    });

    render(<LoginPage />);

    const googleBtn = screen.getByRole('button', { name: /continue with google/i });
    await user.click(googleBtn);

    expect(mockSignInWithPopup).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('displays error message when sign in fails', async () => {
    const user = userEvent.setup();
    mockSignInWithPopup.mockRejectedValueOnce(new Error('Popup closed by user'));

    render(<LoginPage />);

    const googleBtn = screen.getByRole('button', { name: /continue with google/i });
    await user.click(googleBtn);

    expect(mockSignInWithPopup).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
    expect(await screen.findByText('Popup closed by user')).toBeInTheDocument();
  });
});
