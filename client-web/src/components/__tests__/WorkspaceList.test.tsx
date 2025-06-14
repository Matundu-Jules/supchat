import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkspaceList from '../Workspace/WorkspaceList';
import { workspaces } from '../../tests/fixtures/workspaces';
import '../../tests/setup';

describe('WorkspaceList', () => {
  it('renders workspaces and triggers callbacks', async () => {
    const onAccess = vi.fn();
    const user = userEvent.setup();
    render(
      <WorkspaceList workspaces={workspaces} onAccess={onAccess} />
    );

    expect(screen.getByText('Workspace 1')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /accéder/i })[0]);
    expect(onAccess).toHaveBeenCalledWith(workspaces[0]);
  });
});
