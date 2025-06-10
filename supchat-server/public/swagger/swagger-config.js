// public/swagger-config.js

window.onload = () => {
    const ui = SwaggerUIBundle({
        url: 'swagger-output.json',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'BaseLayout',

        requestInterceptor: async (req) => {
            req.credentials = 'include' // autorise l’envoi des cookies

            if (['post', 'put', 'delete'].includes(req.method.toLowerCase())) {
                try {
                    const tokenRes = await fetch('/api/csrf-token', {
                        credentials: 'include',
                    })
                    const { csrfToken } = await tokenRes.json()
                    req.headers['X-CSRF-Token'] = csrfToken
                } catch (err) {
                    console.error('CSRF token fetch failed:', err)
                }
            }

            return req
        },
    })

    window.ui = ui
}
