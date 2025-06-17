const React = require('react')

function ResetPasswordEmail({ resetUrl, userName }) {
    return React.createElement(
        'div',
        { style: { fontFamily: 'Arial, sans-serif', color: '#222' } },
        React.createElement('h2', null, `Bonjour ${userName},`),
        React.createElement(
            'p',
            null,
            'Tu as demandé à réinitialiser ton mot de passe SupChat.',
            React.createElement('br'),
            'Clique sur le bouton ci-dessous pour continuer :'
        ),
        React.createElement(
            'p',
            null,
            React.createElement(
                'a',
                {
                    href: resetUrl,
                    style: {
                        display: 'inline-block',
                        padding: '10px 20px',
                        background: '#007bff',
                        color: '#fff',
                        borderRadius: '5px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                    },
                },
                'Réinitialiser mon mot de passe'
            )
        ),
        React.createElement(
            'p',
            null,
            "Si tu n'es pas à l'origine de cette demande, ignore simplement cet email."
        ),
        React.createElement('p', null, "L'équipe SupChat")
    )
}

module.exports = ResetPasswordEmail
