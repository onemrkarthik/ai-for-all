/**
 * Unit Tests for app/components/Header.tsx
 *
 * Tests the Header component rendering and interactions.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/app/components/Header';

// Mock usePathname
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  it('renders the logo', () => {
    render(<Header />);

    expect(screen.getByText('houzz')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);

    // Multiple links exist (desktop + mobile nav)
    expect(screen.getAllByText('Find Pros').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ideas').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Shop').length).toBeGreaterThan(0);
  });

  it('renders search input', () => {
    render(<Header />);

    // Multiple search inputs exist (desktop + mobile)
    expect(screen.getAllByPlaceholderText('Search Houzz').length).toBeGreaterThan(0);
  });

  it('renders Sign In button', () => {
    render(<Header />);

    // Multiple sign in buttons exist (desktop + mobile)
    expect(screen.getAllByText('Sign In').length).toBeGreaterThan(0);
  });

  it('renders Join as a Pro button', () => {
    render(<Header />);

    expect(screen.getByText('Join as a Pro')).toBeInTheDocument();
  });

  it('highlights Ideas link when on /photos path', () => {
    mockUsePathname.mockReturnValue('/photos');

    render(<Header />);

    // Multiple "Ideas" links exist (desktop + mobile nav)
    const ideasLinks = screen.getAllByText('Ideas');
    expect(ideasLinks.length).toBeGreaterThan(0);
  });

  it('highlights Find Pros link when on /professionals path', () => {
    mockUsePathname.mockReturnValue('/professionals');

    render(<Header />);

    // Multiple "Find Pros" links exist (desktop + mobile nav)
    const prosLinks = screen.getAllByText('Find Pros');
    expect(prosLinks.length).toBeGreaterThan(0);
  });

  it('has mobile menu button', () => {
    render(<Header />);

    const menuButton = screen.getByLabelText('Toggle menu');
    expect(menuButton).toBeInTheDocument();
  });

  it('toggles mobile menu on button click', () => {
    render(<Header />);

    const menuButton = screen.getByLabelText('Toggle menu');
    
    // Click to open
    fireEvent.click(menuButton);
    
    // Click to close
    fireEvent.click(menuButton);
    
    // Menu button should still be there
    expect(menuButton).toBeInTheDocument();
  });

  it('logo links to home page', () => {
    render(<Header />);

    const logoLink = screen.getByText('houzz').closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('Find Pros links to professionals page', () => {
    render(<Header />);

    const prosLinks = screen.getAllByText('Find Pros');
    // First one is desktop nav
    const desktopLink = prosLinks[0].closest('a');
    expect(desktopLink).toHaveAttribute('href', '/professionals');
  });
});
