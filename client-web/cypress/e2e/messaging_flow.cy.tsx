import MessagesPage from '../../src/pages/MessagesPage';
import { messages } from '../../src/tests/fixtures/messages';

describe('messaging flow', () => {
  it('chat between two sessions', () => {
    cy.intercept('GET', '/api/messages/channel/*', { body: messages });
    cy.mount(<MessagesPage />);
    cy.get('input[type="text"]').type('hey');
    cy.contains('button', 'Envoyer').click();
    cy.contains('hey');
  });
});
