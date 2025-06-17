const React = require('react');

function NotificationEmail({ userName, messageText }) {
  return React.createElement(
    'div',
    { style: { fontFamily: 'Arial, sans-serif', color: '#222' } },
    React.createElement('p', null, `Bonjour ${userName},`),
    React.createElement('p', null, 'Vous avez une nouvelle notification sur SupChat:'),
    React.createElement('blockquote', null, messageText),
    React.createElement('p', null, "L'\u00e9quipe SupChat")
  );
}

module.exports = NotificationEmail;
