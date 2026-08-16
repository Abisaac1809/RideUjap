import config from "@rideujap/eslint-config";

export default [
  ...config,
  {
    ignores: ["metro.config.js", "tailwind.config.js"],
  },
];
