const React = require('react')

function WorkspaceInviteEmail({ workspaceName, inviterName, inviteUrl }) {
    return React.createElement(
        'div',
        { style: { fontFamily: 'Arial, sans-serif', color: '#222' } },
        React.createElement(
            'h2',
            null,
            `Invitation à rejoindre "${workspaceName}"`
        ),
        React.createElement(
            'p',
            null,
            `${inviterName} t'invite à rejoindre l'espace de travail "${workspaceName}" sur SupChat.`
        ),
        React.createElement(
            'p',
            null,
            React.createElement(
                'a',
                {
                    href: inviteUrl,
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
                "Accepter l'invitation"
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

module.exports = WorkspaceInviteEmail
