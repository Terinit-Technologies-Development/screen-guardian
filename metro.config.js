const { getDefaultConfig } = require("expo/config");
const { withNativeWind } = require("nativewind/utils");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./src/global.css" });
