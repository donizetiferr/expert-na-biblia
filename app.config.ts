import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * app.config.ts (M6 V8-RETOMADA)
 * Configuracao Expo que le credenciais de runtime via process.env.
 * NAO HARDCODA keys em codigo versionado — usar .env ou gradle properties.
 *
 * Como usar:
 * - dev local:   criar .env (gitignored) com MINIMAX_API_KEY=... e OPENAI_API_KEY=...
 * - CI:          setar secrets no GitHub Actions
 * - EAS Build:   setar via eas.json > build > env
 * - Gradle:      setar em android/gradle.properties e ler via app.config.ts
 */
const config = ({ config }: ConfigContext): ExpoConfig => {
  // newArchEnabled e um campo valido do app config (lido pelo prebuild) mas ainda
  // nao declarado no tipo ExpoConfig desta versao do SDK — tipar o literal com a
  // extensao evita o erro de excess-property sem perder a flag.
  const cfg: ExpoConfig & { newArchEnabled?: boolean } = {
  ...config,
  name: 'Expert Na Bíblia',
  slug: 'expert-na-biblia',
  version: '1.16.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'expertnabiblia',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    // V10 M5.1: reativar splash nativa com logo grande (splash.png 1284x2778 ja existe)
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#3c026d',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.donizetiferr.expertnabiblia',
    buildNumber: '11',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#3c026d',
    },
    package: 'com.donizetiferr.expertnabiblia',
    versionCode: 11,
    permissions: ['NOTIFICATIONS', 'INTERNET'],
    // V23.A.7: Android Auto Backup — preserva o progresso (SQLite expert_na_biblia.db,
    // streak/XP/conclusoes) entre reinstalacoes no mesmo device/conta Google.
    allowBackup: true,
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-sqlite',
    'expo-font',
  ],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
  },
  extra: {
    router: { origin: false },
    eas: { projectId: 'PLACEHOLDER_EAS_PROJECT_ID' },
    privacyPolicyUrl: 'https://donizetiferr.github.io/expert-na-biblia/privacy.html',
    // M6: credenciais LLM (M3 fallback OpenAI) — leem de env vars em runtime
    // Para definir localmente: criar .env com MINIMAX_API_KEY e OPENAI_API_KEY
    // Para CI/EAS: usar eas.json env block
    minimaxApiKey: process.env.MINIMAX_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    minimaxBaseUrl: 'https://api.minimax.io/v1',
    minimaxModel: 'MiniMax-M2.7',
  },
  };
  return cfg;
};

export default config;
