module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [],
    // Doit être le dernier plugin
  };
};
