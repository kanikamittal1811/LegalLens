import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LandingPage from '../app/page';
import LoginPage from '../app/login/page';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock firebase client auth
vi.mock('@/lib/firebase/client', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
}));

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null);
    return () => {};
  }),
  signOut: vi.fn(),
}));

describe('Accessibility (WCAG 2.2 AA) Tests', () => {
  describe('Landing Page Accessibility', () => {
    it('contains main landmark with id="main-content"', () => {
      render(<LandingPage />);
      const main = document.getElementById('main-content');
      expect(main).toBeInTheDocument();
      expect(main?.tagName.toLowerCase()).toBe('main');
    });

    it('has accessible navigation landmark with aria-label', () => {
      render(<LandingPage />);
      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(nav).toBeInTheDocument();
    });

    it('has single primary h1 heading for document hierarchy', () => {
      render(<LandingPage />);
      const headings = screen.getAllByRole('heading', { level: 1 });
      expect(headings).toHaveLength(1);
      expect(headings[0].textContent).toContain('Understand what your contracts actually mean before signing.');
    });

    it('provides an accessible tablist with tabs and tabpanels in interactive demo', async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      const tablist = screen.getByRole('tablist', { name: /interactive demo clauses/i });
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(3);

      const terminationTab = screen.getByRole('tab', { name: /termination/i });
      expect(terminationTab).toHaveAttribute('aria-selected', 'true');

      const ipTab = screen.getByRole('tab', { name: /ip rights/i });
      await user.click(ipTab);
      expect(ipTab).toHaveAttribute('aria-selected', 'true');

      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toBeInTheDocument();
    });
  });

  describe('Login Page Accessibility', () => {
    it('contains main landmark and accessible continue button', () => {
      render(<LoginPage />);
      const main = document.getElementById('main-content');
      expect(main).toBeInTheDocument();

      const googleBtn = screen.getByRole('button', { name: /continue with google/i });
      expect(googleBtn).toBeInTheDocument();
      expect(googleBtn).toHaveAttribute('aria-busy', 'false');
    });

    it('includes accessible links with valid text destinations', () => {
      render(<LoginPage />);
      const homeLink = screen.getByRole('link', { name: /back to legallens homepage/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('Form Controls & Label Accessibility', () => {
    it('associates label with input using htmlFor and id', () => {
      render(
        <div>
          <Label htmlFor="search-input">Search Documents</Label>
          <Input id="search-input" placeholder="Type document name" />
        </div>
      );

      const input = screen.getByLabelText(/search documents/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'search-input');
    });

    it('provides aria-invalid for inputs failing validation', () => {
      render(
        <div>
          <Label htmlFor="email-input">Email Address</Label>
          <Input id="email-input" aria-invalid="true" />
        </div>
      );

      const input = screen.getByLabelText(/email address/i);
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
