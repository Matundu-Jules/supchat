import WorkspacePage from '../../src/pages/WorkspacePage';
import { workspaces } from '../../src/tests/fixtures/workspaces';

describe('workspace flow', () => {
  it('create workspace then invite user', () => {
    cy.intercept('GET', '/api/workspaces', { body: workspaces });
    cy.mount(<WorkspacePage />);
    cy.contains('Créer un workspace').click();
    cy.get('input[name="name"]').type('New WS');
    cy.get('form').submit();
    cy.contains('New WS');
    cy.contains('button', 'Inviter').first().click();
    cy.get('input[type="email"]').type('friend@test.com');
    cy.contains('button', 'Envoyer').click();
  });
});
