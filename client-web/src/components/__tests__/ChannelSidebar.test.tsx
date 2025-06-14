import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChannelSidebar from '../ChannelSidebar';
import { channels } from '../../tests/fixtures/channels';
import '../../tests/setup';

describe('ChannelSidebar', () => {
  it('renders channels list and handles click', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<ChannelSidebar channels={channels} onSelect={onSelect} />);

    expect(screen.getByText('Général')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /général/i }));
    expect(onSelect).toHaveBeenCalledWith(channels[0]);
  });
});
