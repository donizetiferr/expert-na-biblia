const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  // V9.2.1: permite bundlar assets .db (banco SQLite) como resource
  // Sem isso, Metro recusa require('./assets/db.bin') e o seed nao funciona
  config.resolver.assetExts = Array.from(
    new Set([...(config.resolver.assetExts || []), 'db', 'sqlite'])
  );
  return config;
})();
