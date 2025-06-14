import { render, screen } from '@testing-library/react';
import NotificationBell from '../NotificationBell';
import '../../tests/setup';

vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => ({ unread: 2 })
}));

describe('NotificationBell', () => {
  it('shows unread count', () => {
    render(<NotificationBell />);
    expect(screen.getByLabelText(/notifications/i)).toHaveTextContent('2');
  });
});
