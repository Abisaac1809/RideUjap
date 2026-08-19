module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
    // El plugin de worklets (reanimated v4) debe ir de último.
    plugins: ["react-native-worklets/plugin"],
  };
};
