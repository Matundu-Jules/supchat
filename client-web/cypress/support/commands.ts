/// <reference types="cypress" />

// Custom commands pour votre application
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Déclaration TypeScript pour les commandes personnalisées
declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<Element>;
  }
}
