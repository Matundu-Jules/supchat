export default {
    expo: {
        name: 'SupChat Mobile',
        slug: 'supchat-mobile',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/icon.png',
        userInterfaceStyle: 'light',
        splash: {
            image: './assets/splash.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff',
        },
        assetBundlePatterns: ['**/*'],
        ios: {
            supportsTablet: true,
        },
        android: {
            adaptiveIcon: {
                foregroundImage: './assets/adaptive-icon.png',
                backgroundColor: '#ffffff',
            },
        },
        web: {
            favicon: './assets/favicon.png',
        },
        extra: {
            apiUrl:
                process.env.EXPO_PUBLIC_API_URL ||
                `http://${
                    process.env.EXPO_PUBLIC_DEFAULT_HOST || 'localhost'
                }:${process.env.EXPO_PUBLIC_DEFAULT_PORT || '3000'}/api`,
            wsUrl:
                process.env.EXPO_PUBLIC_WS_URL ||
                `ws://${process.env.EXPO_PUBLIC_DEFAULT_HOST || 'localhost'}:${
                    process.env.EXPO_PUBLIC_DEFAULT_PORT || '3000'
                }`,
        },
    },
}
