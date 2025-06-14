import LoginPage from '../../src/pages/LoginPage';

describe('auth flow', () => {
  it('login and redirect', () => {
    cy.intercept('POST', '/api/auth/login', {
      body: { token: 'jwt', user: { email: 'user@test.com' } },
    });
    cy.mount(<LoginPage />);
    cy.get('input[name="email"]').type('user@test.com');
    cy.get('input[name="password"]').type('secret');
    cy.contains('button', /connexion/i).click();
    cy.url().should('contain', '/');
  });
});
