module.exports = {
  extends: ["airbnb-base", "plugin:prettier/recommended"],
  plugins: ["prettier"],
  parserOptions: {
    sourceType: "script"
  },
  rules: {
    "prettier/prettier": "error",
    "no-underscore-dangle": "off"
  }
};
