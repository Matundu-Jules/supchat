import Header from '../../src/components/layout/Header';

describe('notifications', () => {
  it('receive real time notification', () => {
    cy.mount(<Header theme="light" toggleTheme={() => {}} />);
    cy.window().then((win) => {
      const socket = (win as any).io();
      socket.on.callArgWith(0, { _id: '1', message: 'test' });
    });
    cy.get('[aria-label="Notifications"]').should('contain', '1');
  });
});
