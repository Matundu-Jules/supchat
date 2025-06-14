import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthForm from '../AuthForm';
import '../../tests/setup';

describe('AuthForm', () => {
  it('render inputs and submit login', async () => {
    const user = userEvent.setup();
    render(<AuthForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passInput = screen.getByLabelText(/mot de passe/i);
    const submit = screen.getByRole('button', { name: /connexion/i });

    await user.type(emailInput, 'user@example.com');
    await user.type(passInput, 'secret');
    await user.click(submit);

    expect(localStorage.getItem('token')).toBe('jwt');
  });
});
