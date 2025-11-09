module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
    sourceType: "module"
  },
  plugins: [
    "@typescript-eslint",
    "import",
    "security",
    "jsdoc"
  ],
  extends: [
    "airbnb-base",
    "airbnb-typescript/base",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:security/recommended",
    "plugin:jsdoc/recommended-typescript",
    "prettier"
  ],
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json"
      }
    }
  },
  rules: {
    "import/prefer-default-export": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
    ],
    "jsdoc/require-jsdoc": "off"
  }
};

