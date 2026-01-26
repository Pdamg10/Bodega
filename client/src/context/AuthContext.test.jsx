import { render, screen, fireEvent, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import React from 'react';

vi.mock('../config/api', () => {
  return {
    default: {
      post: vi.fn(async () => ({
        data: {
          user: { id: 1, username: 'admin', role: 'admin' },
          access_token: 'mocktoken'
        }
      }))
    }
  };
});

const TestAuth = () => {
  const { user, login, logout, warningActive, secondsLeft } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.username : 'none'}</span>
      <span data-testid="warning">{warningActive ? `on:${secondsLeft}` : 'off'}</span>
      <button onClick={() => login('admin', 'admin123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {});

  test('login persists user in localStorage', async () => {
    render(
      <AuthProvider>
        <TestAuth />
      </AuthProvider>
    );
    fireEvent.click(screen.getByText('Login'));
    await screen.findByText('admin');
    expect(localStorage.getItem('user')).toContain('"username":"admin"');
  });

  test('logout limpia sesión y storage', async () => {
    render(
      <AuthProvider>
        <TestAuth />
      </AuthProvider>
    );
    fireEvent.click(screen.getByText('Login'));
    await screen.findByText('admin');
    fireEvent.click(screen.getByText('Logout'));
    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(localStorage.getItem('user')).toBe(null);
  });
});
