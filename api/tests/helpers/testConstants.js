/**
 * Constantes pour les tests
 * Ces valeurs sont uniquement utilisées en environnement de test
 */

module.exports = {
    // Mots de passe de test standardisés
    TEST_PASSWORD: 'TestPassword123!',
    WEAK_PASSWORD: '123',

    // Emails de test
    TEST_EMAIL_DOMAIN: '@test.com',

    // Autres constantes de test
    TEST_WORKSPACE_NAME: 'Test Workspace',
    TEST_CHANNEL_NAME: 'Test Channel',

    // JWT test
    TEST_JWT_SECRET: 'test-jwt-secret-key-for-testing-only',

    // Timeouts de test
    API_TIMEOUT: 10000,

    // Limites de test
    MAX_FILE_SIZE_TEST: 1024 * 1024, // 1MB
}
