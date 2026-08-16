export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["fix", "feat", "refactor", "chore", "docs", "style", "test", "ci"],
    ],
  },
};
